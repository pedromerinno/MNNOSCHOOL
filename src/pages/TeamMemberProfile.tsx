
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useCompanies } from "@/hooks/useCompanies";
import { UserProfile } from "@/hooks/useUsers";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Send } from "lucide-react";
import { LoadingState } from "@/components/team/LoadingState";
import { EmptyState } from "@/components/team/EmptyState";

const TeamMemberProfile = () => {
  const { memberId } = useParams();
  const navigate = useNavigate();
  const { selectedCompany } = useCompanies();
  const [member, setMember] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [feedback, setFeedback] = useState("");
  const [feedbacks, setFeedbacks] = useState<any[]>([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchMemberProfile = async () => {
      if (!memberId || !selectedCompany) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('profiles')
          .select('id, display_name, email, cargo, avatar, is_admin')
          .eq('id', memberId)
          .single();

        if (error) {
          throw error;
        }

        setMember(data);

        // Fetch existing feedbacks
        const { data: feedbackData, error: feedbackError } = await supabase
          .from('user_feedbacks')
          .select(`
            id,
            content,
            created_at,
            from_user_id,
            from_profile:profiles(id, display_name, avatar)
          `)
          .eq('to_user_id', memberId)
          .eq('company_id', selectedCompany.id)
          .order('created_at', { ascending: false });

        if (feedbackError) {
          console.error("Error fetching feedbacks:", feedbackError);
        } else {
          setFeedbacks(feedbackData || []);
        }
      } catch (err) {
        console.error('Error fetching member profile:', err);
        toast.error("Error loading member profile");
      } finally {
        setIsLoading(false);
      }
    };

    fetchMemberProfile();
  }, [memberId, selectedCompany]);

  const handleSubmitFeedback = async () => {
    if (!feedback.trim() || !selectedCompany || !memberId) {
      return;
    }

    try {
      setSubmitting(true);
      
      const { data: userData } = await supabase.auth.getUser();
      const currentUserId = userData.user?.id;
      
      if (!currentUserId) {
        toast.error("Error identifying current user");
        return;
      }

      const { data, error } = await supabase
        .from('user_feedbacks')
        .insert({
          from_user_id: currentUserId,
          to_user_id: memberId,
          company_id: selectedCompany.id,
          content: feedback
        })
        .select(`
          id,
          content,
          created_at,
          from_user_id,
          from_profile:profiles(id, display_name, avatar)
        `)
        .single();

      if (error) {
        throw error;
      }

      setFeedbacks([data, ...feedbacks]);
      setFeedback("");
      toast.success("Feedback sent successfully!");
    } catch (err: any) {
      console.error('Error sending feedback:', err);
      toast.error(err.message || "Error sending feedback");
    } finally {
      setSubmitting(false);
    }
  };

  if (isLoading) {
    return <LoadingState />;
  }

  if (!member) {
    return (
      <div className="min-h-screen bg-background">
        <main className="container mx-auto px-4 py-8">
          <EmptyState 
            title="Membro não encontrado"
            description="Não foi possível encontrar o membro solicitado."
          />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Button 
            variant="ghost" 
            className="flex items-center gap-2" 
            onClick={() => navigate('/team')}
          >
            <ArrowLeft className="h-4 w-4" /> Back to Team
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Profile Card */}
          <div className="md:col-span-1">
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col items-center">
                  <Avatar className="h-24 w-24 mb-4">
                    <AvatarFallback>
                      {member?.display_name?.substring(0, 2).toUpperCase() || 'U'}
                    </AvatarFallback>
                    {member?.avatar && <AvatarImage src={member.avatar} alt={member.display_name || ''} />}
                  </Avatar>
                  
                  <h2 className="text-xl font-bold text-center">{member?.display_name}</h2>
                  <p className="text-gray-500 dark:text-gray-400 text-center">{member?.email}</p>
                  
                  {member?.cargo && (
                    <p className="text-gray-500 dark:text-gray-400 mt-2 text-center">
                      {member.cargo}
                    </p>
                  )}
                  
                  {member?.is_admin && (
                    <span className="bg-primary/10 text-primary px-2 py-1 rounded text-xs mt-2">
                      Administrator
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Feedback Section */}
          <div className="md:col-span-2">
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Send Feedback</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Textarea
                    placeholder={`Write your feedback for ${member?.display_name}...`}
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    rows={4}
                    className="resize-none"
                  />
                  <Button 
                    onClick={handleSubmitFeedback} 
                    disabled={!feedback.trim() || submitting}
                    className="w-full sm:w-auto flex items-center gap-2"
                  >
                    <Send className="h-4 w-4" /> 
                    Send Feedback
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            {/* Feedbacks List */}
            <Card>
              <CardHeader>
                <CardTitle>Received Feedbacks</CardTitle>
              </CardHeader>
              <CardContent>
                {feedbacks.length === 0 ? (
                  <div className="text-center py-6">
                    <p className="text-gray-500 dark:text-gray-400">
                      No feedback received yet.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {feedbacks.map((feedback) => (
                      <div key={feedback.id} className="border-b border-gray-200 dark:border-gray-800 pb-6 last:border-0 last:pb-0">
                        <div className="flex items-start space-x-3 mb-2">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback>
                              {feedback.from_profile?.display_name?.substring(0, 2).toUpperCase() || 'U'}
                            </AvatarFallback>
                            {feedback.from_profile?.avatar && (
                              <AvatarImage src={feedback.from_profile.avatar} alt={feedback.from_profile.display_name || ''} />
                            )}
                          </Avatar>
                          <div>
                            <p className="font-medium">{feedback.from_profile?.display_name}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {new Date(feedback.created_at).toLocaleDateString('pt-BR', {
                                day: '2-digit',
                                month: '2-digit',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                          </div>
                        </div>
                        <p className="text-gray-700 dark:text-gray-300 pl-11">{feedback.content}</p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default TeamMemberProfile;
