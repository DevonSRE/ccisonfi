export type RegistrationEventName =
  | "registration_started"
  | "form_started"
  | "form_submitted"
  | "registration_complete"
  | "sponsor_link_opened";

type EventParams = Record<string, string | number | boolean | null | undefined>;

type AnalyticsWindow = Window & {
  dataLayer?: Array<Record<string, unknown>>;
  gtag?: (...args: unknown[]) => void;
};

export function trackEvent(eventName: RegistrationEventName, params?: EventParams) {
  if (typeof window === "undefined") return;

  const payload = {
    event: eventName,
    ...(params ?? {}),
  };

  const analyticsWindow = window as AnalyticsWindow;
  analyticsWindow.dataLayer = analyticsWindow.dataLayer || [];
  analyticsWindow.dataLayer.push(payload);

  if (typeof analyticsWindow.gtag === "function") {
    analyticsWindow.gtag("event", eventName, params ?? {});
  }
}
