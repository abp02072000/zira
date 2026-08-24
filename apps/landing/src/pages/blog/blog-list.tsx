import React, { useState, useMemo } from "react";
import { Link } from "wouter";
import { BLOG_POSTS, BlogPost, landingContent, useLang } from "@zira/shared";
import {
  Button,
  Input,
  Badge,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Avatar,
  AvatarImage,
  AvatarFallback,
  useToast,
} from "@zira/ui";
import {
  MagnifyingGlassIcon,
  ClockIcon,
  ArrowRightIcon,
  BookOpenIcon,
  SparklesIcon,
  PaperAirplaneIcon,
  TagIcon,
  XMarkIcon,
  ArrowTrendingUpIcon,
  FunnelIcon,
} from "@heroicons/react/24/solid";
import { BlogHeader } from "../../components/blog-header";
import { LandingFooter } from "../../components/landing-footer";

export default function BlogList() {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("Tous");
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const { lang } = useLang();
  const { toast } = useToast();

  const categories = useMemo(() => [
    "Tous",
    "FinTech",
    "AgriTech",
    "GreenTech",
    "Investissement",
    "Réglementation",
    "Entrepreneuriat",
  ], []);

  const filteredPosts = useMemo(() => {
    return BLOG_POSTS.filter((post) => {
      const matchesCategory =
        selectedCategory === "Tous" || post.category === selectedCategory;
      const matchesSearch =
        post.title.toLowerCase().includes(search.toLowerCase()) ||
        post.excerpt.toLowerCase().includes(search.toLowerCase()) ||
        post.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()));
      return matchesCategory && matchesSearch;
    });
  }, [search, selectedCategory]);

  const featuredPost = useMemo(() => {
    return BLOG_POSTS.find((p) => p.featured) || BLOG_POSTS[0];
  }, []);

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

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail || !newsletterEmail.includes("@")) {
      toast({
        title: lang === "fr" ? "Email invalide" : "Invalid email",
        description:
          lang === "fr"
            ? "Veuillez saisir une adresse email valide."
            : "Please enter a valid email address.",
        variant: "destructive",
      });
      return;
    }
    setSubscribed(true);
    toast({
      title: lang === "fr" ? "Inscription confirmée !" : "Subscription confirmed!",
      description:
        lang === "fr"
          ? "Merci ! Vous recevrez notre newsletter hebdomadaire."
          : "Thank you! You will receive our weekly newsletter.",
    });
    setNewsletterEmail("");
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans selection:bg-primary/20">
      {/* ── En-tête Unifié ── */}
      <BlogHeader />

      {/* ── Hero Banner Thématique ── */}
      <section className="py-12 sm:py-16 md:py-20 border-b bg-muted/30 relative overflow-hidden">
        <div className="absolute inset-0 bg-radial from-primary/10 via-transparent to-transparent pointer-events-none" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 space-y-5">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3.5 py-1 text-xs font-semibold text-primary">
            <BookOpenIcon className="w-4 h-4" />
            <span>
              {lang === "fr"
                ? "Écosystème et Analyses ZIRA RDC"
                : "ZIRA Ecosystem and Insights RDC"}
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground">
            {lang === "fr" ? (
              <>
                Perspectives et Guides{" "}
                <span className="text-primary">d'Investissement en RDC</span>
              </>
            ) : (
              <>
                Insights and Guides for{" "}
                <span className="text-primary">Investment in RDC</span>
              </>
            )}
          </h1>

          <p className="text-muted-foreground text-sm sm:text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
            {lang === "fr"
              ? "Explorez les meilleures pratiques d'equity crowdfunding, les tendances technologiques en RDC et les analyses sectorielles à Kinshasa rédigées par nos experts."
              : "Explore equity crowdfunding best practices, Congolese tech trends, and in-depth sector analyses in Kinshasa written by our investment experts."}
          </p>

          {/* Barre de Recherche Intuitive & Responsive */}
          <div className="max-w-xl mx-auto relative pt-2">
            <div className="relative flex items-center">
              <MagnifyingGlassIcon className="absolute left-3.5 text-muted-foreground w-4 h-4 pointer-events-none" />
              <Input
                type="text"
                placeholder={
                  lang === "fr"
                    ? "Rechercher un article, sujet, mot-clé (FinTech, AgriTech...)..."
                    : "Search articles, topics, keywords..."
                }
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 pr-9 py-2.5 sm:py-3 bg-card border-border rounded-xl text-foreground placeholder:text-muted-foreground focus-visible:ring-primary shadow-xs"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-3 text-muted-foreground hover:text-foreground p-1"
                  aria-label="Effacer la recherche"
                >
                  <XMarkIcon className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── Contenu Principal ── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 flex-1 space-y-10">
        {/* Catégories / Filtres Horizontaux */}
        <div className="flex items-center justify-between gap-4 pb-2 border-b">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none max-w-full">
            <span className="hidden sm:inline-flex items-center text-xs font-semibold text-muted-foreground mr-1">
              <FunnelIcon className="w-3.5 h-3.5 mr-1" />
              Catégories :
            </span>
            {categories.map((cat) => {
              const count =
                cat === "Tous"
                  ? BLOG_POSTS.length
                  : BLOG_POSTS.filter((p) => p.category === cat).length;
              const isActive = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all whitespace-nowrap ${
                    isActive
                      ? "bg-primary text-primary-foreground shadow-xs"
                      : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground border"
                  }`}
                >
                  <span>{cat}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                      isActive
                        ? "bg-primary-foreground/20 text-primary-foreground"
                        : "bg-background text-muted-foreground"
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {(search || selectedCategory !== "Tous") && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSearch("");
                setSelectedCategory("Tous");
              }}
              className="text-xs text-muted-foreground hover:text-foreground whitespace-nowrap"
            >
              Réinitialiser
            </Button>
          )}
        </div>

        {/* Article à la Une (Mis en avant) */}
        {!search && selectedCategory === "Tous" && featuredPost && (
          <div className="rounded-2xl sm:rounded-3xl overflow-hidden border bg-card text-card-foreground shadow-xs hover:border-primary/40 hover:shadow-md transition-all group">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
              <div className="lg:col-span-7 h-56 sm:h-72 lg:h-auto overflow-hidden relative">
                <img
                  src={featuredPost.image}
                  alt={featuredPost.title}
                  className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500"
                />
                <div className="absolute top-4 left-4 flex gap-2">
                  <Badge className="bg-amber-500 text-slate-900 font-bold shadow-xs">
                    <SparklesIcon className="w-3.5 h-3.5 mr-1 inline" />
                    {lang === "fr" ? "À la Une" : "Featured"}
                  </Badge>
                  <Badge variant="secondary" className="bg-background/90 backdrop-blur-xs font-medium">
                    {featuredPost.category}
                  </Badge>
                </div>
              </div>

              <div className="lg:col-span-5 p-6 sm:p-8 lg:p-10 flex flex-col justify-between space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center space-x-3 text-xs text-muted-foreground">
                    <span className="flex items-center">
                      <ClockIcon className="w-3.5 h-3.5 mr-1" /> {featuredPost.readTime}
                    </span>
                    <span>•</span>
                    <span>{featuredPost.publishedAt}</span>
                  </div>

                  <h2 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-foreground group-hover:text-primary transition-colors leading-tight">
                    <Link href={`/blog/${featuredPost.slug}`}>
                      {featuredPost.title}
                    </Link>
                  </h2>

                  <p className="text-muted-foreground text-sm sm:text-base line-clamp-3 leading-relaxed">
                    {featuredPost.excerpt}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-4 border-t gap-3">
                  <div className="flex items-center space-x-3 min-w-0">
                    <Avatar className="w-9 h-9 border border-primary/20 shrink-0">
                      <AvatarImage
                        src={featuredPost.author.avatar}
                        alt={featuredPost.author.name}
                      />
                      <AvatarFallback>
                        {featuredPost.author.name[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <div className="text-xs sm:text-sm font-semibold text-foreground truncate">
                        {featuredPost.author.name}
                      </div>
                      <div className="text-[11px] text-muted-foreground truncate">
                        {featuredPost.author.role}
                      </div>
                    </div>
                  </div>

                  <Link href={`/blog/${featuredPost.slug}`}>
                    <Button size="sm" className="font-semibold shrink-0 bg-primary text-primary-foreground hover:bg-primary/90">
                      <span>{lang === "fr" ? "Lire l'article" : "Read post"}</span>
                      <ArrowRightIcon className="w-3.5 h-3.5 ml-1.5" />
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Grille de Tous les Articles */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg sm:text-xl font-bold text-foreground flex items-center gap-2">
              <ArrowTrendingUpIcon className="w-5 h-5 text-primary" />
              <span>
                {selectedCategory === "Tous"
                  ? lang === "fr"
                    ? "Articles récents"
                    : "Latest articles"
                  : `${lang === "fr" ? "Sujet :" : "Topic:"} ${selectedCategory}`}
              </span>
              <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full font-medium">
                {filteredPosts.length}
              </span>
            </h3>
          </div>

          {filteredPosts.length === 0 ? (
            <div className="text-center py-16 bg-card rounded-2xl border p-8 space-y-3">
              <BookOpenIcon className="w-10 h-10 text-muted-foreground mx-auto" />
              <p className="text-foreground font-semibold text-base">
                {lang === "fr"
                  ? "Aucun article ne correspond à votre recherche."
                  : "No articles found matching your criteria."}
              </p>
              <p className="text-muted-foreground text-xs sm:text-sm max-w-sm mx-auto">
                {lang === "fr"
                  ? "Essayez de modifier votre mot-clé ou de sélectionner une autre catégorie."
                  : "Try modifying your keywords or selecting another category."}
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearch("");
                  setSelectedCategory("Tous");
                }}
              >
                {lang === "fr" ? "Voir tous les articles" : "View all articles"}
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {filteredPosts.map((post) => (
                <Card
                  key={post.id}
                  className="bg-card text-card-foreground border-border hover:border-primary/40 hover:shadow-md transition-all duration-200 flex flex-col justify-between overflow-hidden group rounded-2xl"
                >
                  <div>
                    <div className="h-48 overflow-hidden relative bg-muted">
                      <img
                        src={post.image}
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                      <Badge className="absolute top-3 left-3 bg-background/90 text-foreground backdrop-blur-xs font-semibold shadow-xs">
                        {post.category}
                      </Badge>
                    </div>

                    <CardHeader className="p-5 pb-2 space-y-2">
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{post.publishedAt}</span>
                        <span className="flex items-center">
                          <ClockIcon className="w-3 h-3 mr-1" /> {post.readTime}
                        </span>
                      </div>
                      <CardTitle className="text-base sm:text-lg font-bold text-foreground group-hover:text-primary transition-colors line-clamp-2 leading-snug">
                        <Link href={`/blog/${post.slug}`}>{post.title}</Link>
                      </CardTitle>
                    </CardHeader>

                    <CardContent className="px-5 pb-4 space-y-3">
                      <p className="text-muted-foreground text-xs sm:text-sm line-clamp-3 leading-relaxed">
                        {post.excerpt}
                      </p>

                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {post.tags.slice(0, 3).map((tag) => (
                          <button
                            key={tag}
                            onClick={() => setSearch(tag)}
                            className="text-[11px] text-muted-foreground bg-muted hover:bg-primary/10 hover:text-primary px-2 py-0.5 rounded-md flex items-center transition-colors cursor-pointer"
                          >
                            <TagIcon className="w-2.5 h-2.5 mr-1 text-primary" /> {tag}
                          </button>
                        ))}
                      </div>
                    </CardContent>
                  </div>

                  <div className="p-5 pt-3 border-t flex items-center justify-between mt-auto bg-muted/10">
                    <div className="flex items-center space-x-2 min-w-0">
                      <Avatar className="w-6 h-6 border">
                        <AvatarImage
                          src={post.author.avatar}
                          alt={post.author.name}
                        />
                        <AvatarFallback className="text-[10px]">
                          {post.author.name[0]}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-xs font-medium text-foreground truncate max-w-[120px]">
                        {post.author.name}
                      </span>
                    </div>

                    <Link href={`/blog/${post.slug}`}>
                      <span className="text-xs font-bold text-primary hover:underline flex items-center cursor-pointer">
                        {lang === "fr" ? "Lire" : "Read"}
                        <ArrowRightIcon className="w-3.5 h-3.5 ml-1" />
                      </span>
                    </Link>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* ── Section Newsletter Élégante ── */}
        <section className="bg-primary/5 border border-primary/20 rounded-2xl sm:rounded-3xl p-6 sm:p-10 md:p-12 text-center relative overflow-hidden my-8">
          <div className="max-w-2xl mx-auto space-y-5 relative z-10">
            <Badge variant="outline" className="border-primary/30 text-primary bg-primary/10 px-3 py-1 text-xs">
              <SparklesIcon className="w-3.5 h-3.5 mr-1.5 inline text-amber-500" />
              {lang === "fr" ? "Veille Stratégique" : "Strategic Watch"}
            </Badge>

            <h3 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
              {lang === "fr"
                ? "Restez informé des meilleures opportunités"
                : "Stay informed about top African opportunities"}
            </h3>

            <p className="text-muted-foreground text-xs sm:text-sm md:text-base leading-relaxed">
              {lang === "fr"
                ? "Recevez chaque semaine nos synthèses de marché, nos analyses sectorielles et les alertes lors de l'ouverture de nouvelles campagnes d'equity crowdfunding."
                : "Get our weekly market summaries, sector deep dives, and instant alerts when new verified equity crowdfunding campaigns launch."}
            </p>

            <form
              onSubmit={handleSubscribe}
              className="flex flex-col sm:flex-row items-center justify-center gap-2.5 max-w-md mx-auto pt-2"
            >
              <Input
                type="email"
                placeholder={
                  lang === "fr"
                    ? "Votre adresse email professionnelle..."
                    : "Your business email address..."
                }
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                className="bg-card border-border text-foreground rounded-xl py-2.5 text-sm w-full"
                required
              />
              <Button
                type="submit"
                className="w-full sm:w-auto font-semibold rounded-xl px-5 py-2.5 shrink-0 shadow-xs bg-primary text-primary-foreground hover:bg-primary/90"
              >
                <span>{lang === "fr" ? "S'abonner" : "Subscribe"}</span>
                <PaperAirplaneIcon className="w-3.5 h-3.5 ml-2" />
              </Button>
            </form>
          </div>
        </section>
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
