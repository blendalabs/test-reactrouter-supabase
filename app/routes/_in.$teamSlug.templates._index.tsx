import { useNavigate, useLoaderData, type MetaFunction } from 'react-router';
import { requireAuthWithClient, ensureUserProfile } from '../lib/auth.server';
import type { TemplateWithLocalesAndBrands } from '../types/global';
import {
  getSupportedLocaleFlag,
  getSupportedLocaleName,
} from '../services/locales';
import { appService } from '~/services/app';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import { Badge } from '~/components/ui/badge';
import { Play, Globe, Clock } from 'lucide-react';
import BrandSelector from '~/components/BrandSelector';

export const meta: MetaFunction = () => {
  return [{ title: `Video Templates - ${appService.strings.app.title}` }];
};

export async function loader({
  request,
  params,
}: {
  request: Request;
  params: { teamSlug: string };
}) {
  const { user, supabaseClient } = await requireAuthWithClient(request);
  const url = new URL(request.url);
  const brandSlug = url.searchParams.get('brand');

  // Ensure user has a profile
  try {
    await ensureUserProfile(user, request);
  } catch {
    // Continue anyway, the profile creation might have failed but we can still show templates
  }

  // Get team by slug
  const { data: team, error: teamError } = await supabaseClient
    .from('teams')
    .select('id, name, slug')
    .eq('slug', params.teamSlug)
    .single();

  if (teamError || !team) {
    throw new Error('Team not found');
  }

  // Verify user is a member of this team
  const { data: teamMember, error: memberError } = await supabaseClient
    .from('team_members')
    .select('role')
    .eq('team_id', team.id)
    .eq('user_id', user.id)
    .single();

  if (memberError || !teamMember) {
    throw new Error('Access denied: You are not a member of this team');
  }

  // Get all brands for the filter dropdown
  const { data: brands, error: brandsError } = await supabaseClient
    .from('brands')
    .select('*')
    .order('name');

  if (brandsError) {
    throw new Error('Failed to load brands');
  }

  // Build query for templates using the view
  const templatesQuery = supabaseClient
    .from('view_templates_with_brands')
    .select('*')
    .eq('team_id', team.id);

  // Apply brand filter if specified
  if (brandSlug) {
    templatesQuery.eq('brand_slug', brandSlug);
  }

  const { data: templates, error } = await templatesQuery.order('created_at', {
    ascending: false,
  });

  if (error) {
    throw new Error('Failed to load templates');
  }

  // Get template locales separately
  const templateIds = templates?.map(t => t.id) || [];
  const { data: templateLocales, error: localesError } = await supabaseClient
    .from('template_locales')
    .select('*')
    .in('template_id', templateIds);

  if (localesError) {
    throw new Error('Failed to load template locales');
  }

  // Combine templates with their locales
  const templatesWithLocales =
    templates?.map(template => ({
      ...template,
      template_locales:
        templateLocales?.filter(locale => locale.template_id === template.id) ||
        [],
    })) || [];

  return {
    user,
    team,
    templates: templatesWithLocales,
    brands: brands || [],
    selectedBrandSlug: brandSlug,
  };
}

// Helper function to get template status based on locales
function getTemplateStatus(
  template: TemplateWithLocalesAndBrands
): 'completed' | 'in-progress' | 'draft' {
  const locales = template.template_locales || [];
  if (locales.length === 0) return 'draft';
  if (
    locales.some(
      (locale: { last_render_url?: string | null }) => locale.last_render_url
    )
  )
    return 'completed';
  return 'in-progress';
}

function formatTemplateDuration(template: TemplateWithLocalesAndBrands) {
  if (!template.duration || template.duration === 0) return '--:--';
  const totalSeconds = Math.floor(template.duration / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  function pad(n: number) {
    return n.toString().padStart(2, '0');
  }

  if (hours > 0) {
    return `${hours}:${pad(minutes)}:${pad(seconds)}`;
  } else {
    return `${minutes}:${pad(seconds)}`;
  }
}

// Locale data is now provided by the locales service

export default function TemplatesPage() {
  const navigate = useNavigate();
  const { user, team, templates, brands, selectedBrandSlug } =
    useLoaderData<typeof loader>();

  const handleTemplateClick = (templateId: string) => {
    // Navigate to the first locale's edit page
    const template = templates.find(t => t.id === templateId);
    if (template?.template_locales?.[0]) {
      navigate(
        `/${team.slug}/templates/${templateId}/${template.template_locales[0].locale}/edit`
      );
    } else {
      // If no locales, navigate to the first available locale (usually 'en')
      navigate(`/${team.slug}/templates/${templateId}/en/edit`);
    }
  };
  return (
    <div className="space-y-6">
      {/* Brand Filter */}
      <BrandSelector brands={brands} selectedBrandSlug={selectedBrandSlug} />

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {templates.map((template, index) => (
          <Card
            key={template.id}
            className="cursor-pointer hover:shadow-xl transition-all duration-300 group hover:-translate-y-1 animate-in slide-in-from-bottom-4"
            style={{ animationDelay: `${index * 50}ms` }}
            onClick={() => handleTemplateClick(template.id)}
          >
            <CardHeader className="p-0">
              <div className="relative overflow-hidden rounded-t-lg">
                <img
                  src={
                    template.thumbnail_url
                      ? template.thumbnail_url
                      : '/video-placeholder.svg'
                  }
                  alt={template.title}
                  className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 rounded-t-lg flex items-center justify-center">
                  <Play className="h-12 w-12 text-white opacity-0 group-hover:opacity-90 transition-all duration-300 transform scale-75 group-hover:scale-100" />
                </div>
                <div className="absolute bottom-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-sm backdrop-blur-sm">
                  {formatTemplateDuration(template)}
                </div>
                <Badge
                  variant={
                    getTemplateStatus(template) === 'completed'
                      ? 'default'
                      : getTemplateStatus(template) === 'in-progress'
                        ? 'secondary'
                        : 'outline'
                  }
                  className="absolute top-2 left-2 backdrop-blur-sm"
                >
                  {getTemplateStatus(template).replace('-', ' ')}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-4">
              <CardTitle className="text-lg mb-2 line-clamp-2 group-hover:text-primary transition-colors duration-200">
                {template.title}
              </CardTitle>

              {/* Brand Badge */}
              {template.brand_name && (
                <div className="mb-2">
                  <Badge variant="secondary" className="text-xs">
                    {template.brand_name}
                  </Badge>
                </div>
              )}

              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                <Clock className="h-4 w-4" />
                <span suppressHydrationWarning>
                  Created{' '}
                  {new Date(template.created_at || '').toLocaleDateString()}
                </span>
                {template.creator_user_id !== user.id && (
                  <span className="text-xs bg-muted px-2 py-1 rounded">
                    Shared
                  </span>
                )}
              </div>

              {/* Locales */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Globe className="h-4 w-4" />
                </div>
                <div className="flex flex-wrap gap-1">
                  {template.template_locales?.map(
                    (
                      locale: { id: string; locale: string },
                      localeIndex: number
                    ) => (
                      <Badge
                        key={locale.id}
                        variant="secondary"
                        className="text-xs transition-all duration-200 hover:scale-105 animate-in slide-in-from-left-2"
                        style={{
                          animationDelay: `${index * 50 + localeIndex * 25}ms`,
                        }}
                      >
                        <span className="mr-1">
                          {getSupportedLocaleFlag(locale.locale)}
                        </span>
                        {getSupportedLocaleName(locale.locale)}
                      </Badge>
                    )
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {templates.length === 0 && (
        <div className="text-center py-12 animate-in fade-in-50 slide-in-from-bottom-4">
          <div className="text-muted-foreground">
            <Globe className="h-12 w-12 mx-auto mb-4 opacity-50 animate-pulse" />
            <p className="text-lg mb-2">No templates found</p>
            <p>Try adjusting your search or create a new template</p>
          </div>
        </div>
      )}
    </div>
  );
}
