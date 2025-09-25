import { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';

interface AnalyticsEvent {
  event_type: string;
  page_url?: string;
  user_id?: string;
  session_id: string;
  properties?: Record<string, any>;
}

interface PageView {
  page_url: string;
  user_id?: string;
  session_id: string;
  referrer?: string;
  time_on_page?: number;
}

export const useAnalytics = (user: User | null) => {
  const sessionId = useRef<string>();
  const pageStartTime = useRef<number>(Date.now());
  const lastPageUrl = useRef<string>('');

  useEffect(() => {
    // Generate session ID
    sessionId.current = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }, []);

  const trackEvent = async (eventType: string, properties?: Record<string, any>) => {
    if (!sessionId.current) return;

    try {
      const event: AnalyticsEvent = {
        event_type: eventType,
        page_url: window.location.pathname,
        user_id: user?.id,
        session_id: sessionId.current,
        properties: {
          ...properties,
          timestamp: new Date().toISOString(),
          screen_resolution: `${screen.width}x${screen.height}`,
          viewport: `${window.innerWidth}x${window.innerHeight}`,
          language: navigator.language,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
        }
      };

      await supabase.functions.invoke('track-analytics', {
        body: event
      });
    } catch (error) {
      console.error('Analytics tracking error:', error);
    }
  };

  const trackPageView = async (url?: string) => {
    if (!sessionId.current) return;

    const currentUrl = url || window.location.pathname;
    const now = Date.now();
    
    // Track time on previous page
    if (lastPageUrl.current && lastPageUrl.current !== currentUrl) {
      const timeOnPage = now - pageStartTime.current;
      
      try {
        const previousPageView: PageView = {
          page_url: lastPageUrl.current,
          user_id: user?.id,
          session_id: sessionId.current,
          referrer: document.referrer || undefined,
          time_on_page: Math.round(timeOnPage / 1000) // Convert to seconds
        };

        await supabase.functions.invoke('track-analytics', {
          body: previousPageView
        });
      } catch (error) {
        console.error('Previous page view tracking error:', error);
      }
    }

    // Track new page view
    try {
      const pageView: PageView = {
        page_url: currentUrl,
        user_id: user?.id,
        session_id: sessionId.current,
        referrer: document.referrer || undefined
      };

      await supabase.functions.invoke('track-analytics', {
        body: pageView
      });
    } catch (error) {
      console.error('Page view tracking error:', error);
    }

    lastPageUrl.current = currentUrl;
    pageStartTime.current = now;
  };

  // Auto-track page views
  useEffect(() => {
    trackPageView();

    // Track page visibility changes
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        trackPageView();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [user]);

  // Track common interactions
  useEffect(() => {
    const handleScroll = () => {
      const scrollPercent = Math.round(
        (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100
      );
      
      if (scrollPercent > 0 && scrollPercent % 25 === 0) {
        trackEvent('scroll_depth', { scroll_percent: scrollPercent });
      }
    };

    const handleClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (target.tagName === 'A' || target.closest('a')) {
        const link = target.closest('a');
        trackEvent('link_click', {
          url: link?.href,
          text: link?.textContent?.trim(),
          external: link?.hostname !== window.location.hostname
        });
      } else if (target.tagName === 'BUTTON' || target.closest('button')) {
        const button = target.closest('button');
        trackEvent('button_click', {
          text: button?.textContent?.trim(),
          type: button?.type
        });
      }
    };

    let scrollTimeout: NodeJS.Timeout;
    const throttledScroll = () => {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(handleScroll, 1000);
    };

    window.addEventListener('scroll', throttledScroll);
    document.addEventListener('click', handleClick);

    return () => {
      window.removeEventListener('scroll', throttledScroll);
      document.removeEventListener('click', handleClick);
      clearTimeout(scrollTimeout);
    };
  }, [user]);

  return {
    trackEvent,
    trackPageView,
    sessionId: sessionId.current
  };
};