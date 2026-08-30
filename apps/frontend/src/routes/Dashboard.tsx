import { useEvents } from '../hooks/useEvents';
import { useNotifications } from '../hooks/useNotifications';
import FarmInfo from '../components/FarmInfo';
import DeviceList from '../components/DeviceList';
import EventCard from '../components/EventCard';
import NotificationCard from '../components/NotificationCard';
import SkeletonCard from '../components/SkeletonCard';
import ErrorState from '../components/ErrorState';
import EmptyState from '../components/EmptyState';

function Dashboard() {
  const {
    data: eventsData,
    isLoading: eventsLoading,
    isError: eventsError,
  } = useEvents({ limit: 10 });

  const {
    data: notificationsData,
    isLoading: notificationsLoading,
    isError: notificationsError,
  } = useNotifications({ limit: 10 });

  const events = eventsData?.data ?? [];
  const notifications = notificationsData?.data ?? [];

  return (
    <div>
      <h1 className="font-titulo text-lg font-semibold text-card-foreground mb-5">
        Farm Overview
      </h1>

      {/* Top row: FarmInfo + DeviceList */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
        <FarmInfo />
        <DeviceList />
      </div>

      {/* Latest Events */}
      <section className="bg-card rounded-card border border-border shadow-sm mb-5">
        <h2 className="font-titulo text-[15px] font-semibold px-5 pt-5 pb-3 border-b border-border">
          Latest Events
        </h2>
        <div className="px-5 py-5">
          {eventsLoading && <SkeletonCard lines={4} />}
          {eventsError && <ErrorState />}
          {!eventsLoading && !eventsError && events.length === 0 && (
            <EmptyState title="No events yet" />
          )}
          {!eventsLoading && !eventsError && events.length > 0 && (
            <div className="divide-y divide-border">
              {events.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Latest Notifications */}
      <section className="bg-card rounded-card border border-border shadow-sm">
        <h2 className="font-titulo text-[15px] font-semibold px-5 pt-5 pb-3 border-b border-border">
          Latest Notifications
        </h2>
        <div className="px-5 py-5">
          {notificationsLoading && <SkeletonCard lines={4} />}
          {notificationsError && <ErrorState />}
          {!notificationsLoading &&
            !notificationsError &&
            notifications.length === 0 && (
              <EmptyState title="No notifications yet" />
            )}
          {!notificationsLoading &&
            !notificationsError &&
            notifications.length > 0 && (
              <div className="divide-y divide-border">
                {notifications.map((notification) => (
                  <NotificationCard
                    key={notification.id}
                    notification={notification}
                  />
                ))}
              </div>
            )}
        </div>
      </section>
    </div>
  );
}

export default Dashboard;