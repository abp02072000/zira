import React, { useState, useEffect } from "react";
import { Link, useRoute } from "wouter";
import { BLOG_POSTS, landingContent, useLang } from "@zira/shared";
import {
  Button,
  Badge,
  Avatar,
  AvatarImage,
  AvatarFallback,
  Card,
  CardContent,
  useToast,
} from "@zira/ui";
import {
  ArrowLeftIcon,
  ClockIcon,
  CalendarIcon,
  ShareIcon,
  TagIcon,
  BookOpenIcon,
  ArrowRightIcon,
  CheckBadgeIcon,
  CheckIcon,
  BookmarkIcon,
  SparklesIcon,
  ChevronRightIcon,
  ArrowTrendingUpIcon,
} from "@heroicons/react/24/solid";
import { BlogHeader } from "../../components/blog-header";
import { LandingFooter } from "../../components/landing-footer";

export default function BlogDetail() {
  const [, params] = useRoute<{ slug: string }>("/blog/:slug");
  const slug = params ? params.slug : "";
  const { lang } = useLang();
  const { toast } = useToast();

  const [copied, setCopied] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  const post = BLOG_POSTS.find((p) => p.slug === slug) || BLOG_POSTS[0];
  const relatedPosts = BLOG_POSTS.filter((p) => p.id !== post.id).slice(0, 2);

  // Barre de progression de lecture au scroll
  useEffect(() => {
    const handleScroll = () => {
      const totalHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        const currentProgress = (window.scrollY / totalHeight) * 100;
        setScrollProgress(Math.min(100, Math.max(0, currentProgress)));
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleShare = async () => {
    const shareUrl = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: post.title,
          text: post.excerpt,
          url: shareUrl,
        });
        return;
      } catch {
        // Fallback to clipboard
      }
    }

    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast({
        title: lang === "fr" ? "Lien copié !" : "Link copied!",
        description:
          lang === "fr"
            ? "Le lien vers cet article a été copié dans votre presse-papiers."
            : "The article link has been copied to your clipboard.",
      });
      setTimeout(() => setCopied(false), 2500);
    } catch {
      toast({
        title: "Partage",
        description: shareUrl,
      });
    }
  };

  const handleBookmark = () => {
    setBookmarked(!bookmarked);
    toast({
      title: !bookmarked
        ? lang === "fr"
          ? "Article sauvegardé"
          : "Article saved"
        : lang === "fr"
        ? "Article retiré des favoris"
        : "Article removed from bookmarks",
      description: post.title,
    });
  };

  const getPorteurUrl = () => {
    return window.location.hostname === "localhost"
      ? "http://localhost:3000/porteur"
      : "/porteur";
  };

  const getInvestisseurUrl = () => {
    return window.location.hostname === "localhost"
      ? "http://localhost:3000/investisseur"
      : "/investisseur";
  };

  const getModerateurUrl = () => {
    return window.location.hostname === "localhost"
      ? "http://localhost:3000/moderation"
      : "/moderation";
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans selection:bg-primary/20">
      {/* ── Barre de progression de lecture discrète ── */}
      <div
        className="fixed top-0 left-0 h-1 bg-primary z-50 transition-all duration-100 ease-out"
        style={{ width: `${scrollProgress}%` }}
      />

      {/* ── Header Unifié ── */}
      <BlogHeader showBackButton />

      {/* ── Fil d'Ariane & En-tête Article ── */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 flex-1 space-y-8">
        {/* Fil d'Ariane */}
        <nav className="flex items-center space-x-2 text-xs text-muted-foreground overflow-x-auto pb-1">
          <Link href="/" className="hover:text-foreground transition-colors">
            {lang === "fr" ? "Accueil" : "Home"}
          </Link>
          <ChevronRightIcon className="w-3.5 h-3.5 shrink-0" />
          <Link href="/blog" className="hover:text-foreground transition-colors">
            Blog
          </Link>
          <ChevronRightIcon className="w-3.5 h-3.5 shrink-0" />
          <span className="text-primary font-medium">{post.category}</span>
        </nav>

        {/* Titre et Métadonnées */}
        <header className="space-y-5">
          <div className="flex flex-wrap items-center gap-2.5 text-xs text-muted-foreground">
            <Badge className="bg-primary/10 text-primary border-primary/20 font-semibold px-3 py-1">
              {post.category}
            </Badge>
            <span>•</span>
            <span className="flex items-center">
              <CalendarIcon className="w-3.5 h-3.5 mr-1" /> {post.publishedAt}
            </span>
            <span>•</span>
            <span className="flex items-center">
              <ClockIcon className="w-3.5 h-3.5 mr-1" /> {post.readTime}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tight text-foreground leading-tight">
            {post.title}
          </h1>

          <p className="text-muted-foreground text-sm sm:text-base md:text-lg leading-relaxed italic border-l-4 border-primary pl-4 py-1.5 bg-primary/5 rounded-r-xl">
            {post.excerpt}
          </p>

          {/* Profil Auteur et Actions Sociales */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-b py-4">
            <div className="flex items-center space-x-3.5">
              <Avatar className="w-11 h-11 border-2 border-primary/20">
                <AvatarImage src={post.author.avatar} alt={post.author.name} />
                <AvatarFallback>{post.author.name[0]}</AvatarFallback>
              </Avatar>
              <div>
                <div className="text-sm font-bold text-foreground flex items-center">
                  {post.author.name}
                  <CheckBadgeIcon className="w-4 h-4 text-primary ml-1.5 inline shrink-0" />
                </div>
                <div className="text-xs text-muted-foreground">
                  {post.author.role}
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2 self-end sm:self-auto">
              <Button
                variant="outline"
                size="sm"
                onClick={handleBookmark}
                className={`text-xs font-semibold ${
                  bookmarked ? "text-primary border-primary" : "text-muted-foreground"
                }`}
              >
                <BookmarkIcon className="w-3.5 h-3.5 mr-1.5" />
                {bookmarked
                  ? lang === "fr"
                    ? "Sauvegardé"
                    : "Saved"
                  : lang === "fr"
                  ? "Sauvegarder"
                  : "Save"}
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={handleShare}
                className="text-xs font-semibold text-muted-foreground hover:text-foreground"
              >
                {copied ? (
                  <>
                    <CheckIcon className="w-3.5 h-3.5 mr-1.5 text-primary" />
                    {lang === "fr" ? "Copié !" : "Copied!"}
                  </>
                ) : (
                  <>
                    <ShareIcon className="w-3.5 h-3.5 mr-1.5" />
                    {lang === "fr" ? "Partager" : "Share"}
                  </>
                )}
              </Button>
            </div>
          </div>
        </header>

        {/* ── Image de Couverture Responsive ── */}
        <div className="rounded-2xl sm:rounded-3xl overflow-hidden border bg-muted shadow-xs h-64 sm:h-80 md:h-[400px] relative">
          <img
            src={post.image}
            alt={post.title}
            className="w-full h-full object-cover"
          />
        </div>

        {/* ── Encart Points Clés Stratégiques ── */}
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-5 sm:p-6 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-300">
            <SparklesIcon className="w-4 h-4 text-amber-500" />
            <span>{lang === "fr" ? "Points Clés à Retenir" : "Key Takeaways"}</span>
          </div>
          <ul className="space-y-2 text-xs sm:text-sm text-foreground/90 list-disc list-inside leading-relaxed">
            <li>
              {lang === "fr"
                ? "L'equity crowdfunding permet aux PME à Kinshasa de diversifier leurs sources de financement tout en fidélisant une communauté d'ambassadeurs."
                : "Equity crowdfunding allows Kinshasa startups to diversify funding sources while turning supporters into brand advocates."}
            </li>
            <li>
              {lang === "fr"
                ? "Une gouvernance saine, conforme OHADA, et une Data Room exhaustive constituent le premier facteur de conversion des investisseurs."
                : "Robust OHADA governance and a transparent Data Room are the primary drivers of investor trust and conversion."}
            </li>
            <li>
              {lang === "fr"
                ? "ZIRA Invest garantit la conformité KYC et la traçabilité des flux en USD et CDF pour chaque transaction."
                : "ZIRA Invest guarantees verified KYC compliance and real-time transaction traceability for all deals."}
            </li>
          </ul>
        </div>

        {/* ── Corps de l'Article (Formaté & Lisible) ── */}
        <article className="prose dark:prose-invert max-w-none text-foreground/90 text-sm sm:text-base md:text-lg leading-relaxed space-y-6 pt-2">
          <div
            dangerouslySetInnerHTML={{ __html: post.content }}
            className="space-y-4 [&>h2]:text-xl sm:[&>h2]:text-2xl [&>h2]:font-bold [&>h2]:tracking-tight [&>h2]:text-foreground [&>h2]:mt-8 [&>h2]:mb-3 [&>h3]:text-lg sm:[&>h3]:text-xl [&>h3]:font-semibold [&>h3]:text-foreground [&>h3]:mt-6 [&>h3]:mb-2 [&>p]:leading-relaxed [&>p]:text-muted-foreground [&>p]:mb-4"
          />
        </article>

        {/* ── Mots-clés (Tags) ── */}
        <div className="pt-6 border-t space-y-3">
          <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
            {lang === "fr" ? "Mots-clés et Thématiques" : "Related Topics"}
          </div>
          <div className="flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <Link key={tag} href="/blog">
                <Badge
                  variant="outline"
                  className="hover:border-primary/40 hover:bg-primary/10 hover:text-primary transition-colors cursor-pointer px-3 py-1 text-xs"
                >
                  <TagIcon className="w-3 h-3 mr-1.5 text-primary" /> {tag}
                </Badge>
              </Link>
            ))}
          </div>
        </div>

        {/* ── Carte Signature Auteur ── */}
        <div className="bg-card border rounded-2xl p-6 flex flex-col sm:flex-row items-center sm:items-start gap-4">
          <Avatar className="w-16 h-16 border-2 border-primary/30 shrink-0">
            <AvatarImage src={post.author.avatar} alt={post.author.name} />
            <AvatarFallback>{post.author.name[0]}</AvatarFallback>
          </Avatar>
          <div className="space-y-2 text-center sm:text-left flex-1">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
              <h4 className="text-base font-bold text-foreground">
                {post.author.name}
              </h4>
              <span className="text-xs text-primary font-semibold">
                {post.author.role}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              {lang === "fr"
                ? "Contributeur régulier sur la plateforme ZIRA Invest. Passionné par l'innovation financière, le venture capital et le développement de solutions à fort impact en Afrique."
                : "Regular contributor to ZIRA Invest. Passionate about financial innovation, venture capital, and high-impact African startups."}
            </p>
          </div>
        </div>

        {/* ── CTA Bannière de Conversion ── */}
        <section className="bg-primary/5 border border-primary/20 rounded-2xl p-6 sm:p-8 text-center space-y-4">
          <h3 className="text-xl sm:text-2xl font-bold text-foreground">
            {lang === "fr"
              ? "Prêt à financer ou lancer votre projet ?"
              : "Ready to invest or launch your campaign?"}
          </h3>
          <p className="text-muted-foreground text-xs sm:text-sm max-w-lg mx-auto">
            {lang === "fr"
              ? "Accédez dès maintenant aux opportunités d'investissement vérifiées ou soumettez votre dossier en 5 étapes simples."
              : "Access verified African opportunities or submit your venture in 5 straightforward steps."}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Link href="/choisir">
              <Button className="font-semibold shadow-xs bg-primary text-primary-foreground hover:bg-primary/90">
                {lang === "fr" ? "Accéder aux Portails ZIRA" : "Access ZIRA Portals"}
                <ArrowRightIcon className="w-4 h-4 ml-1.5" />
              </Button>
            </Link>
            <Link href="/blog">
              <Button variant="outline" className="font-semibold">
                <BookOpenIcon className="w-4 h-4 mr-1.5" />
                {lang === "fr" ? "Tous les articles" : "All articles"}
              </Button>
            </Link>
          </div>
        </section>

        {/* ── Articles Similaires ── */}
        <div className="pt-8 border-t space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
              <ArrowTrendingUpIcon className="w-5 h-5 text-primary" />
              <span>{lang === "fr" ? "Continuer la lecture" : "Continue Reading"}</span>
            </h3>
            <Link href="/blog">
              <span className="text-xs font-semibold text-primary hover:underline flex items-center">
                {lang === "fr" ? "Voir tout le blog" : "View all blog"}
                <ArrowRightIcon className="w-3.5 h-3.5 ml-1" />
              </span>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {relatedPosts.map((rel) => (
              <Card
                key={rel.id}
                className="bg-card text-card-foreground border-border hover:border-primary/40 hover:shadow-md transition-all duration-200 flex flex-col justify-between overflow-hidden group rounded-2xl"
              >
                <div className="h-40 overflow-hidden relative bg-muted">
                  <img
                    src={rel.image}
                    alt={rel.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <Badge className="absolute top-3 left-3 bg-background/90 text-foreground backdrop-blur-xs font-semibold">
                    {rel.category}
                  </Badge>
                </div>

                <CardContent className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                      <ClockIcon className="w-3.5 h-3.5 mr-1" />
                      <span>{rel.readTime}</span>
                    </div>
                    <h4 className="text-base font-bold text-foreground group-hover:text-primary transition-colors line-clamp-2 leading-snug">
                      <Link href={`/blog/${rel.slug}`}>{rel.title}</Link>
                    </h4>
                    <p className="text-muted-foreground text-xs sm:text-sm line-clamp-2 leading-relaxed">
                      {rel.excerpt}
                    </p>
                  </div>

                  <div className="pt-3 border-t flex items-center justify-between mt-auto">
                    <span className="text-xs text-muted-foreground">
                      {rel.author.name}
                    </span>
                    <Link href={`/blog/${rel.slug}`}>
                      <span className="text-xs font-bold text-primary hover:underline flex items-center cursor-pointer">
                        {lang === "fr" ? "Lire l'article" : "Read post"}
                        <ArrowRightIcon className="w-3.5 h-3.5 ml-1" />
                      </span>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>

      {/* ── Footer Unifié ── */}
      <LandingFooter
        footer={landingContent.footer}
        porteurUrl={getPorteurUrl()}
        investisseurUrl={getInvestisseurUrl()}
        moderateurUrl={getModerateurUrl()}
      />
    </div>
  );
}
