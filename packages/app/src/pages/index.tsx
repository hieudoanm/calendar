import {
  LandingContent,
  LandingTemplate,
} from '@calendar/templates/LandingTemplate';
import { NextPage } from 'next';

const content: LandingContent = {
  navbar: {
    title: 'Calendar',
    buttonText: 'Open Calendar',
    buttonHref: '/app',
  },
  hero: {
    title: 'Stay Organized Effortlessly',
    tagline:
      'Plan your day, week, and month with a sleek, privacy-first calendar app.',
    buttonText: 'Get Started',
    buttonHref: '/app',
  },
  features: {
    title: 'Features',
    items: [
      {
        id: 'smart-reminders',
        emoji: '⏰',
        title: 'Smart Reminders',
        description: 'Never miss an event with intelligent notifications.',
      },
      {
        id: 'privacy-first',
        emoji: '🔒',
        title: 'Privacy-First',
        description: 'All your events are stored locally on your device.',
      },
      {
        id: 'multi-view',
        emoji: '📅',
        title: 'Multi-View',
        description: 'Switch easily between daily, weekly, and monthly views.',
      },
      {
        id: 'sync',
        emoji: '🔗',
        title: 'Seamless Sync',
        description: 'Sync across devices without sending data to the cloud.',
      },
      {
        id: 'customization',
        emoji: '🎨',
        title: 'Customization',
        description: 'Themes, colors, and layouts to suit your workflow.',
      },
      {
        id: 'integration',
        emoji: '⚡',
        title: 'Integration',
        description: 'Connect with your favorite apps and tools effortlessly.',
      },
    ],
  },
  cta: {
    title: 'Start Planning Today',
    description: 'Your schedule, fully under your control. No signup required.',
    buttonText: 'Open Calendar',
    buttonHref: '/app',
  },
  footer: {
    name: 'Calendar',
  },
};

const HomePage: NextPage = () => {
  return <LandingTemplate content={content} />;
};

export default HomePage;
