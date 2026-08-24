import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ShieldCheck, User, Building2, Edit, Camera } from "lucide-react";
import { useAppData } from "@/contexts/app-data-context";
import { useAuth } from "@/contexts/auth-context";
import { RedirectIfNotOnboarded } from "@/components/redirect-if-not-onboarded";
import { isOnboarded } from "@/components/onboarding-carousel";
import { useToast } from "@/hooks/use-toast";
import { useLang } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { updateUserProfile, uploadFile } from "@/lib/api-client";
import { extractIdentityNameCandidate } from "@/lib/identity-name";
import { ProfileExtrasForm } from "@/components/profile-extras-form";
import { ProfilePreferencesCard } from "@/components/profile-preferences-card";
import {
  getProfileExtras,
  setProfileExtras,
  type ProfileExtras,
} from "@/lib/profile-completion";

export default function InvestisseurProfil() {
  const { toast } = useToast();
  const { t } = useLang();
  const { profile, refreshProfile } = useAuth();
  const { currentInvestorId, getUser, getInvestmentsByInvestor, formatUSD } =
    useAppData();
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const rawUser = getUser(currentInvestorId) ?? profile;
  const investments = getInvestmentsByInvestor(currentInvestorId);
  const totalInvested = investments.reduce((s, i) => s + i.amountUSD, 0);
  const avgEquity = investments.length
    ? (
        investments.reduce((s, i) => s + i.equityReceived, 0) /
        investments.length
      ).toFixed(1)
    : "0";

  const [personType, setPersonType] = useState<"physique" | "morale">(
    "physique",
  );
  const [profileState, setProfileState] = useState({
    name: "",
    title: "",
    description: "",
    photo: "",
  });
  const [extras, setExtras] = useState<ProfileExtras>({});
  const [form, setForm] = useState(profileState);
  const lastIdentityNameSyncRef = useRef<string>("");

  useEffect(() => {
    if (!rawUser) return;
    setPersonType(rawUser.type === "morale" ? "morale" : "physique");
    setProfileState({
      name: rawUser.name ?? "",
      title: rawUser.title ?? "",
      description: rawUser.description ?? "",
      photo: rawUser.photo ?? "",
    });
    setExtras(getProfileExtras(rawUser.id));
  }, [
    rawUser?.id,
    rawUser?.name,
    rawUser?.title,
    rawUser?.description,
    rawUser?.photo,
    rawUser?.type,
  ]);

  if (!isOnboarded("investisseur")) {
    return (
      <RedirectIfNotOnboarded
        universe="investisseur"
        to="/investisseur/onboarding"
      />
    );
  }
  if (!rawUser) {
    return (
      <div className="py-20 px-6 text-center space-y-4">
        <div className="w-20 h-20 bg-muted rounded-full mx-auto flex items-center justify-center">
          <User className="w-10 h-10 text-muted-foreground" />
        </div>
        <h1 className="text-xl font-bold">Profil non initialisé</h1>
        <p className="text-muted-foreground text-sm max-w-xs mx-auto">
          Votre profil n&apos;a pas encore été créé. Déconnectez-vous puis
          reconnectez-vous.
        </p>
        <Button
          variant="outline"
          onClick={() => {
            window.location.href = "/";
          }}
        >
          Retour à l&apos;accueil
        </Button>
      </div>
    );
  }

  const currentUser = rawUser;
  const user = { ...currentUser, ...profileState, type: personType };

  const verifiedIdentityName =
    extras.idVerified && extras.ocrFullName
      ? (extractIdentityNameCandidate(extras.ocrFullName) ?? "")
      : "";
  const displayedName = verifiedIdentityName || user.name;

  async function persistAll(
    next: typeof profileState,
    type: "physique" | "morale",
    nextExtras: ProfileExtras,
  ) {
    setSaving(true);
    try {
      await updateUserProfile(currentUser.id, {
        name: next.name,
        title: next.title,
        description: next.description,
        photo: next.photo,
        type,
      });
      setProfileExtras(currentUser.id, nextExtras);
      setProfileState(next);
      setExtras(nextExtras);
      await refreshProfile();
      toast({ title: t.invProfileTitle, description: t.save });
    } catch (e) {
      toast({
        title: "Erreur",
        description:
          e instanceof Error ? e.message : "Enregistrement impossible",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  }

  function normalizeDisplayName(value: string): string {
    return value.replace(/\s+/g, " ").trim().toLowerCase();
  }

  async function handleIdentityNameDetected(identityName: string) {
    // Pour un profil personne morale, le nom de société reste prioritaire.
    if (personType === "morale") return;

    const currentName = (profileState.name || currentUser.name || "").trim();
    const nextName = identityName.trim();

    if (!nextName) return;

    if (normalizeDisplayName(nextName) === normalizeDisplayName(currentName))
      return;

    // Mise à jour optimiste de l'affichage local, puis persistance backend.
    setProfileState((prev) => ({ ...prev, name: nextName }));
    setForm((prev) => ({ ...prev, name: nextName }));

    try {
      const updated = await updateUserProfile(currentUser.id, {
        name: nextName,
        title: profileState.title,
        description: profileState.description,
        photo: profileState.photo,
        type: personType,
      });
      const syncedName = updated.name ?? nextName;
      setProfileState((prev) => ({ ...prev, name: syncedName }));
      setForm((prev) => ({ ...prev, name: syncedName }));
      lastIdentityNameSyncRef.current = normalizeDisplayName(syncedName);
      await refreshProfile();
      toast({
        title: "Nom mis à jour",
        description: `Nom détecté depuis la pièce: ${syncedName}`,
      });
    } catch (e) {
      lastIdentityNameSyncRef.current = "";
      toast({
        title: "Synchronisation du nom impossible",
        description:
          e instanceof Error
            ? e.message
            : "Le nom détecté n'a pas pu être appliqué automatiquement.",
        variant: "destructive",
      });
    }
  }

  useEffect(() => {
    if (personType === "morale" || !extras.idVerified) return;

    const detectedName = extractIdentityNameCandidate(extras.ocrFullName);
    if (!detectedName) return;

    const normalizedDetected = normalizeDisplayName(detectedName);
    if (!normalizedDetected) return;

    const normalizedCurrent = normalizeDisplayName(
      profileState.name || currentUser.name || "",
    );
    if (normalizedDetected === normalizedCurrent) return;

    if (lastIdentityNameSyncRef.current === normalizedDetected) return;

    lastIdentityNameSyncRef.current = normalizedDetected;
    void handleIdentityNameDetected(detectedName);
  }, [
    personType,
    extras.idVerified,
    extras.ocrFullName,
    profileState.name,
    currentUser.name,
  ]);

  async function handleSave() {
    await persistAll(form, personType, extras);
    setOpen(false);
  }

  async function handleTypeChange(type: "physique" | "morale") {
    setPersonType(type);
    await persistAll(profileState, type, extras);
  }

  async function handlePhotoUpload(file: File | null) {
    if (!file) return;
    try {
      const url = await uploadFile(file, "avatar");
      const next = { ...profileState, photo: url };
      setProfileState(next);
      setForm((f) => ({ ...f, photo: url }));
      await persistAll(next, personType, extras);
    } catch (e) {
      toast({
        title: "Erreur",
        description: e instanceof Error ? e.message : "Upload impossible",
        variant: "destructive",
      });
    }
  }

  return (
    <div className="py-6 px-4 md:px-6 space-y-4">
      <div className="bg-card border rounded-2xl p-6 flex flex-col items-center text-center gap-3">
        <label className="relative w-20 h-20 rounded-2xl overflow-hidden bg-muted cursor-pointer group">
          {user.photo ? (
            <img
              src={user.photo}
              alt={user.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-primary/20 flex items-center justify-center text-2xl font-bold text-primary">
              {(user.name || "?").slice(0, 1)}
            </div>
          )}
          <span className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
            <Camera className="w-5 h-5 text-white" />
          </span>
          <input
            type="file"
            accept="image/*"
            className="sr-only"
            onChange={(e) => handlePhotoUpload(e.target.files?.[0] ?? null)}
          />
        </label>
        <div>
          <h1 className="text-xl font-bold">{displayedName}</h1>
          <p className="text-sm text-muted-foreground">
            {profileState.title || "—"}
          </p>
        </div>
        <div className="flex gap-2 mt-1">
          <button
            type="button"
            onClick={() => handleTypeChange("physique")}
            className={cn(
              "flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium border transition-colors",
              personType === "physique"
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-background border-border text-muted-foreground",
            )}
          >
            <User className="w-3.5 h-3.5" /> Physique
          </button>
          <button
            type="button"
            onClick={() => handleTypeChange("morale")}
            className={cn(
              "flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium border transition-colors",
              personType === "morale"
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-background border-border text-muted-foreground",
            )}
          >
            <Building2 className="w-3.5 h-3.5" /> Morale
          </button>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5"
          onClick={() => {
            setForm(profileState);
            setOpen(true);
          }}
        >
          <Edit className="w-3.5 h-3.5" /> Modifier
        </Button>
      </div>

      <div className="mb-6">
        <ProfilePreferencesCard
          universe="investisseur"
          isKycApproved={extras.idVerified}
          isKycPending={!extras.idVerified && !!extras.idDocumentUrl}
        />
      </div>

      <ProfileExtrasForm
        extras={extras}
        onChange={(next) => {
          setExtras(next);
          setProfileExtras(currentUser.id, next);
        }}
        onIdentityNameDetected={handleIdentityNameDetected}
        universe="investisseur"
        userEmail={currentUser.email}
        userName={user.name}
        userType={personType}
      />

      <div className="bg-card border rounded-2xl p-5">
        <h2 className="text-base font-semibold mb-2">À propos</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {profileState.description || "Ajoutez une description dans Modifier."}
        </p>
      </div>

      <div className="bg-card border rounded-2xl p-5">
        <h2 className="text-base font-semibold mb-3">Statut KYC</h2>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-green-600 font-medium text-sm">
            <span className="w-2.5 h-2.5 rounded-full bg-green-500 inline-block" />
            {user.status === "active" ? "Vérifié" : "En attente"}
          </div>
          {user.status === "active" && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <ShieldCheck className="w-4 h-4 text-green-500" />
              Validé
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-card border rounded-2xl p-4 text-center">
          <p className="text-base sm:text-lg font-bold text-primary leading-tight truncate">
            {formatUSD(totalInvested)}
          </p>
          <p className="text-xs text-muted-foreground mt-1">Total investi</p>
        </div>
        <div className="bg-card border rounded-2xl p-4 text-center">
          <p className="text-base sm:text-lg font-bold text-primary leading-tight">
            {new Set(investments.map((i) => i.projectId)).size}
          </p>
          <p className="text-xs text-muted-foreground mt-1">Projets</p>
        </div>
        <div className="bg-card border rounded-2xl p-4 text-center">
          <p className="text-base sm:text-lg font-bold text-primary leading-tight">
            {avgEquity}%
          </p>
          <p className="text-xs text-muted-foreground mt-1">Équité moy.</p>
        </div>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t.invProfileEditTitle}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label>{t.invProfileFullName}</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label>{t.invProfileTitleField}</Label>
              <Input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label>{t.invProfileAbout}</Label>
              <Textarea
                rows={4}
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              {t.cancel}
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? "..." : t.save}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
