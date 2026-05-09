import { getPublicSettings } from '@/lib/content';
import SiteHeaderClient, { type SiteHeaderNavItem } from '@/components/SiteHeaderClient';

const navItems: SiteHeaderNavItem[] = [
  { href: '/about', label: 'About' },
  { href: '/services', label: 'Services' },
  { href: '/projects', label: 'Projects' },
  { href: '/reviews', label: 'Reviews' },
  { href: '/contact', label: 'Contact' },
];

export default async function SiteHeader() {
  const settings = await getPublicSettings();
  const visibleNavItems = navItems.filter(item => {
    if (item.href === '/about') return settings.controls.pages.about;
    if (item.href === '/services') return settings.controls.pages.services;
    if (item.href === '/projects') return settings.controls.pages.projects;
    if (item.href === '/reviews') return settings.controls.pages.reviews;
    if (item.href === '/contact') return settings.controls.pages.contact;
    return true;
  });

  return (
    <SiteHeaderClient
      brandTitle={settings.footer.brand_title}
      navItems={visibleNavItems}
      showContactCta={settings.controls.pages.contact}
    />
  );
}
