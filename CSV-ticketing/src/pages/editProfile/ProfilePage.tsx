import { UserProfileAPI } from "@/API/endpoint";
import EditProfileForm from "@/components/kit/editProfileForm";
import { useEffect, useState } from "react";
import ViewProfile from "../../components/kit/ViewProfile";

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await UserProfileAPI.getProfile();
        console.log(response.data.message);
        if (response.data.message === "User profile not found") {
          setIsEditing(true); // Allow user to edit profile
        } else {
          setUserData(response.data);
        }
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("An unknown error occurred.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, []);

  if (loading) return <p>Loading user profile...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="container mx-auto py-3">
      {isEditing ? (
        <EditProfileForm
          userData={userData} // Required prop
          onCancel={() => setIsEditing(false)} // Required prop
          onSave={(updatedData) => {
            setUserData(updatedData); // Required prop
            setIsEditing(false);
          }}
        />
      ) : (
        <ViewProfile userData={userData} onEdit={() => setIsEditing(true)} />
      )}
    </div>
  );
}
