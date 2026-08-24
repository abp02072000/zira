import React, { useEffect, useState } from "react";
import { useAppData, useAuth, useLang, updateUserProfile, uploadFile, getProfileExtras, setProfileExtras, type ProfileExtras } from "@zira/shared";
import { RedirectIfNotOnboarded, isOnboarded, useToast, ProfileExtrasForm, ProfilePreferencesCard } from "@zira/ui";
import { ProfileCoverHeader } from "../components/profil/profile-cover-header";
import { ProfileSkillsSection } from "../components/profil/profile-skills-section";
import { ProfileExperienceSection } from "../components/profil/profile-experience-section";
import { ProfileEditDialog } from "../components/profil/profile-edit-dialog";

/**
 * Page de gestion du profil porteur de projet et conformité KYC.
 */
export default function PorteurProfil() {
  const { toast } = useToast();
  const { t } = useLang();
  const { profile, refreshProfile } = useAuth();
  const { currentPorteurId, getUser } = useAppData();
  const rawUser = getUser(currentPorteurId) ?? profile;

  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [profileState, setProfileState] = useState({ name: "", title: "", bio: "", skills: [] as string[], photo: "" });
  const [extras, setExtras] = useState<ProfileExtras>({});

  useEffect(() => {
    if (!rawUser) return;
    setProfileState({
      name: rawUser.name ?? "",
      title: rawUser.title ?? "",
      bio: rawUser.bio ?? "",
      skills: rawUser.skills ?? [],
      photo: rawUser.photo ?? "",
    });
    setExtras(getProfileExtras(rawUser.id));
  }, [rawUser]);

  if (!isOnboarded("porteur")) {
    return <RedirectIfNotOnboarded universe="porteur" to="/porteur/onboarding" />;
  }
  if (!rawUser) return null;

  const persist = async (nextState: typeof profileState, nextExtras: ProfileExtras) => {
    setSaving(true);
    try {
      await updateUserProfile(rawUser.id, nextState);
      setProfileExtras(rawUser.id, nextExtras);
      setProfileState(nextState);
      setExtras(nextExtras);
      await refreshProfile();
      toast({ title: t.porteurProfileTitle, description: t.save });
    } catch (e) {
      toast({ title: "Erreur", description: e instanceof Error ? e.message : "Erreur", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handlePhotoUpload = async (file: File | null) => {
    if (!file) return;
    try {
      const url = await uploadFile(file, "avatar");
      void persist({ ...profileState, photo: url }, extras);
    } catch {
      toast({ title: "Erreur", description: "Upload impossible", variant: "destructive" });
    }
  };

  return (
    <div className="pb-8 space-y-6">
      <ProfileCoverHeader
        displayName={profileState.name || rawUser.name}
        title={profileState.title}
        address={extras.address || ""}
        bio={profileState.bio}
        photo={profileState.photo}
        onEditClick={() => setOpen(true)}
        onPhotoUpload={handlePhotoUpload}
      />
      <div className="px-4 md:px-6 space-y-6">
        <ProfilePreferencesCard universe="porteur" isKycApproved={extras.idVerified} isKycPending={!extras.idVerified && !!extras.idDocumentUrl} />
        <ProfileExtrasForm extras={extras} onChange={(next) => { setExtras(next); setProfileExtras(rawUser.id, next); }} universe="porteur" userEmail={rawUser.email} userName={profileState.name || rawUser.name} userType={rawUser.type ?? "physique"} />
      </div>
      <ProfileSkillsSection
        skills={profileState.skills}
        onAddSkill={(s) => !profileState.skills.includes(s) && void persist({ ...profileState, skills: [...profileState.skills, s] }, extras)}
        onRemoveSkill={(s) => void persist({ ...profileState, skills: profileState.skills.filter((sk) => sk !== s) }, extras)}
      />
      <ProfileExperienceSection experience={rawUser.experience} education={rawUser.education} />
      <ProfileEditDialog open={open} onOpenChange={setOpen} initialData={profileState} saving={saving} onSave={(data) => { void persist({ ...profileState, ...data }, extras); setOpen(false); }} />
    </div>
  );
}
