import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getUserNotifications, markNotificationAsRead } from '@/lib/emailService';
import { useAuth } from '@/hooks/useAuth';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Bell, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

export const NotificationsPage: React.FC = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotifications = async () => {
      if (!user) return;

      try {
        const userNotifications = await getUserNotifications(user.id);
        setNotifications(userNotifications);
        setLoading(false);
      } catch (error) {
        console.error('Erreur de chargement des notifications', error);
        toast.error('Impossible de charger les notifications');
        setLoading(false);
      }
    };

    fetchNotifications();
  }, [user]);

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await markNotificationAsRead(notificationId);
      setNotifications(notifications.map(notif => 
        notif.id === notificationId ? { ...notif, is_read: true } : notif
      ));
      toast.success('Notification marquée comme lue');
    } catch (error) {
      console.error('Erreur lors du marquage', error);
      toast.error('Impossible de marquer la notification');
    }
  };

  if (loading) {
    return <div>Chargement des notifications...</div>;
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6 flex items-center">
        <Bell className="mr-3" /> Mes Notifications
      </h1>

      {notifications.length === 0 ? (
        <div className="text-center text-gray-500">
          Aucune notification pour le moment
        </div>
      ) : (
        <div className="space-y-4">
          {notifications.map((notification) => (
            <Card 
              key={notification.id} 
              className={`${notification.is_read ? 'opacity-60' : 'border-primary'}`}
            >
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>{notification.subject}</CardTitle>
                <Badge variant={notification.is_read ? 'secondary' : 'default'}>
                  {notification.is_read ? 'Lu' : 'Nouveau'}
                </Badge>
              </CardHeader>
              <CardContent>
                <p>{notification.message}</p>
                <div className="flex justify-between items-center mt-4">
                  <span className="text-sm text-muted-foreground">
                    {format(new Date(notification.created_at), 'dd MMMM yyyy à HH:mm', { locale: fr })}
                  </span>
                  {!notification.is_read && (
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleMarkAsRead(notification.id)}
                    >
                      <CheckCircle className="mr-2 h-4 w-4" /> Marquer comme lu
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default NotificationsPage;
