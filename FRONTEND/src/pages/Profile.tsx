import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { authAPI } from "@/lib/api";
import { User, Upload, Edit2, Save, X, ArrowLeft } from "lucide-react";

export default function Profile() {
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Editable fields
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [gender, setGender] = useState("");
  const [country, setCountry] = useState("");
  const [photoPreview, setPhotoPreview] = useState("");

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const data = await authAPI.getProfile();
      setProfile(data);
      setName(data.name || "");
      setMobile(data.mobile || "");
      setDateOfBirth(data.date_of_birth || "");
      setGender(data.gender || "");
      setCountry(data.country || "");
      setPhotoPreview(data.profile_photo || "");
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load profile",
        variant: "destructive",
      });
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Profile photo must be less than 5MB",
          variant: "destructive",
        });
        return;
      }

      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = reader.result as string;
        setPhotoPreview(base64String);
        
        // Upload immediately
        try {
          await authAPI.uploadProfilePhoto(base64String);
          toast({
            title: "Success",
            description: "Profile photo updated",
          });
          loadProfile();
        } catch (error) {
          toast({
            title: "Error",
            description: "Failed to upload photo",
            variant: "destructive",
          });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await authAPI.updateProfile({
        name,
        mobile: mobile || undefined,
        date_of_birth: dateOfBirth || undefined,
        gender: gender || undefined,
        country: country || undefined,
      });

      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
      
      setEditing(false);
      loadProfile();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.detail || "Failed to update profile",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (profile) {
      setName(profile.name || "");
      setMobile(profile.mobile || "");
      setDateOfBirth(profile.date_of_birth || "");
      setGender(profile.gender || "");
      setCountry(profile.country || "");
    }
    setEditing(false);
  };

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading profile...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate("/dashboard")}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
          
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold">My Profile</h1>
            {!editing && (
              <Button onClick={() => setEditing(true)} className="gradient-primary">
                <Edit2 className="w-4 h-4 mr-2" />
                Edit Profile
              </Button>
            )}
          </div>
        </div>

        <Card className="p-8 gradient-card border-border/50">
          {/* Profile Photo */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-32 h-32 rounded-full bg-muted flex items-center justify-center overflow-hidden mb-4">
              {photoPreview ? (
                <img src={photoPreview} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <User className="w-16 h-16 text-muted-foreground" />
              )}
            </div>
            <Label htmlFor="photo" className="cursor-pointer">
              <div className="flex items-center gap-2 text-sm text-primary hover:underline">
                <Upload className="w-4 h-4" />
                Change Profile Photo
              </div>
              <Input
                id="photo"
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="hidden"
              />
            </Label>
          </div>

          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              {/* Email (read-only) */}
              <div className="col-span-2 space-y-2">
                <Label>Email</Label>
                <Input
                  value={profile.email}
                  disabled
                  className="bg-muted"
                />
              </div>

              {/* Name */}
              <div className="col-span-2 space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={!editing}
                  className={editing ? "bg-background/50" : "bg-muted"}
                />
              </div>

              {/* Mobile */}
              <div className="col-span-2 space-y-2">
                <Label htmlFor="mobile">Mobile Number</Label>
                <Input
                  id="mobile"
                  type="tel"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  disabled={!editing}
                  className={editing ? "bg-background/50" : "bg-muted"}
                  placeholder="Not provided"
                />
              </div>

              {/* Date of Birth */}
              <div className="space-y-2">
                <Label htmlFor="dob">Date of Birth</Label>
                <Input
                  id="dob"
                  type="date"
                  value={dateOfBirth}
                  onChange={(e) => setDateOfBirth(e.target.value)}
                  disabled={!editing}
                  className={editing ? "bg-background/50" : "bg-muted"}
                />
              </div>

              {/* Gender */}
              <div className="space-y-2">
                <Label htmlFor="gender">Gender</Label>
                {editing ? (
                  <Select value={gender} onValueChange={setGender}>
                    <SelectTrigger className="bg-background/50">
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <Input
                    value={gender || "Not specified"}
                    disabled
                    className="bg-muted capitalize"
                  />
                )}
              </div>

              {/* Country */}
              <div className="col-span-2 space-y-2">
                <Label htmlFor="country">Country</Label>
                <Input
                  id="country"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  disabled={!editing}
                  className={editing ? "bg-background/50" : "bg-muted"}
                  placeholder="Not provided"
                />
              </div>

              {/* Member Since */}
              <div className="col-span-2 space-y-2">
                <Label>Member Since</Label>
                <Input
                  value={new Date(profile.created_at).toLocaleDateString()}
                  disabled
                  className="bg-muted"
                />
              </div>
            </div>

            {editing && (
              <div className="flex gap-4 pt-4">
                <Button
                  onClick={handleSave}
                  disabled={loading}
                  className="flex-1 gradient-primary"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {loading ? "Saving..." : "Save Changes"}
                </Button>
                <Button
                  onClick={handleCancel}
                  variant="outline"
                  className="flex-1"
                >
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
