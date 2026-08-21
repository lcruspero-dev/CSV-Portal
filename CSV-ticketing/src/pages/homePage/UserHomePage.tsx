/* eslint-disable @typescript-eslint/no-explicit-any */
import { NteAPI, TicketAPi } from "@/API/endpoint";
// import SurveyModal from "@/components/kit/Survey";
import { AnimatePresence, motion } from "framer-motion";
import {
  Clock,
  FileText,
  Users,
  HeadphonesIcon,
  Ticket,
  Bell,
  Briefcase,
  Shield,
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import TitleCase from "@/utils/titleCase";

interface Feature {
  id: number;
  title: string;
  description: string;
  icon: React.ComponentType<{
    className?: string;
    style?: React.CSSProperties;
  }>;
  path: string;
  accent: string;
  softBg: string;
  label: string;
  notification: number;
  exclamation?: boolean;
  tooltip?: string;
}

const UserHome = () => {
  const navigate = useNavigate();

  const [unacknowledgedCount, setUnacknowledgedCount] = useState(0);
  const [nteNotificationCount, setNteNotificationCount] = useState(0);
  const [nteTooltip, setNteTooltip] = useState("");
  const [showExclamation, setShowExclamation] = useState(false);

  const userString = localStorage.getItem("user");
  const user = userString ? JSON.parse(userString) : null;

  useEffect(() => {
    const getUnacknowledgedCount = async () => {
      try {
        const response = await TicketAPi.getAllMemos();
        const unacknowledgedMemos = response.data.filter(
          (memo: { acknowledgedby: { userId: any }[] }) =>
            !memo.acknowledgedby?.some(
              (ack: { userId: any }) => ack.userId === user?._id,
            ),
        );
        setUnacknowledgedCount(unacknowledgedMemos.length);
      } catch (error) {
        console.error(error);
      }
    };

    const getNteNotificationCount = async () => {
      try {
        if (!user) return;

        const response = await NteAPI.getNtesByUser();
        const nteData = response.data;

        if (!nteData?.length) {
          setNteNotificationCount(0);
          setShowExclamation(false);
          setNteTooltip("");
          return;
        }

        const currentNte = nteData[0];

        let count = 0;
        let tooltip = "";
        let exclamation = false;

        if (currentNte.status === "PER") {
          if (!currentNte.nte?.employeeSignatureDate) {
            count = 1;
            tooltip += "Please sign the NTE.\n";
          }
          if (!currentNte.employeeFeedback?.responseDetail?.trim()) {
            count = 1;
            tooltip += "Submit explanation within 5 days.";
          }
        }

        if (
          currentNte.status === "PNODA" &&
          !currentNte.noticeOfDecision?.employeeSignatureDate
        ) {
          exclamation = true;
          tooltip += "Please acknowledge the Notice of Decision.";
        }

        setNteNotificationCount(count);
        setShowExclamation(exclamation);
        setNteTooltip(tooltip);
      } catch (error) {
        console.error(error);
      }
    };

    if (user) {
      getUnacknowledgedCount();
      getNteNotificationCount();
    }
  }, [user]);

  // An NTE can need attention via a numeric count (PER: sign / submit
  // explanation) OR via the exclamation-only case (PNODA: acknowledge
  // decision, no count attached to it). Both should count as one pending
  // action so the header stat and the card badge agree with each other.
  const ntePendingActions =
    nteNotificationCount > 0 ? nteNotificationCount : showExclamation ? 1 : 0;
  const totalPendingActions = unacknowledgedCount + ntePendingActions;

  const features: Feature[] = [
    {
      id: 1,
      title: "Time Tracker",
      description: "Track your work hours and attendance",
      icon: Clock,
      path: "/timetracker",
      accent: "#7c3aed",
      softBg: "#f5f3ff",
      label: "Attendance",
      notification: 0,
    },
    {
      id: 2,
      title: "Company Memos",
      description: "Access company memos and policies",
      icon: FileText,
      path: "/view-polMemo",
      accent: "#4f46e5",
      softBg: "#eef2ff",
      label: "Documents",
      notification: unacknowledgedCount,
    },
    {
      id: 3,
      title: "HR Support",
      description: "Request HR assistance",
      icon: Users,
      path: "/request-something",
      accent: "#0284c7",
      softBg: "#f0f9ff",
      label: "Human Resources",
      notification: 0,
    },
    {
      id: 4,
      title: "IT Support",
      description: "Get technical help",
      icon: HeadphonesIcon,
      path: "/create-ticket",
      accent: "#059669",
      softBg: "#f0fdf4",
      label: "Technical",
      notification: 0,
    },
    {
      id: 5,
      title: "My Tickets",
      description: "View support tickets",
      icon: Ticket,
      path: "/view-ticket",
      accent: "#d97706",
      softBg: "#fffbeb",
      label: "Requests",
      notification: 0,
    },
    {
      id: 6,
      title: "Employee Notice",
      description: "Disciplinary notices",
      icon: Bell,
      path: "/nte",
      accent: "#dc2626",
      softBg: "#fef2f2",
      label: "Notices",
      notification: nteNotificationCount,
      exclamation: showExclamation,
      tooltip: nteTooltip,
    },
  ];

  const containerVariants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.07 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 14 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.38, ease: "easeOut" },
    },
  };

  // Time Tracker is the default hero. Hovering (or focusing, for keyboard
  // users) a carousel card previews that service in the hero instead;
  // moving away reverts to the default. All services live in the carousel,
  // including Time Tracker itself.
  const DEFAULT_FEATURED_ID = 1;
  const defaultFeatured =
    features.find((f) => f.id === DEFAULT_FEATURED_ID) ?? features[0];
  const [hoveredId, setHoveredId] = useState<number | null>(null);
  const heroFeature =
    features.find((f) => f.id === hoveredId) ?? defaultFeatured;
  const carouselFeatures = features;

  // Carousel: tracks which card is centered so the arrow buttons and dot
  // indicator stay in sync with whatever the person scrolled or swiped to.
  const carouselRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const container = carouselRef.current;
    if (!container) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio > 0.6) {
            const idx = Number((entry.target as HTMLElement).dataset.index);
            if (!Number.isNaN(idx)) setActiveIndex(idx);
          }
        });
      },
      { root: container, threshold: [0.6] },
    );
    cardRefs.current.forEach((el) => el && observer.observe(el));
    return () => observer.disconnect();
  }, [carouselFeatures.length]);

  const scrollToIndex = (index: number) => {
    cardRefs.current[index]?.scrollIntoView({
      behavior: "smooth",
      inline: "center",
      block: "nearest",
    });
  };

  const scrollByCard = (direction: 1 | -1) => {
    const container = carouselRef.current;
    const card = cardRefs.current[0];
    if (!container) return;
    const amount = (card?.offsetWidth ?? 260) + 16;
    container.scrollBy({ left: amount * direction, behavior: "smooth" });
  };

  return (
    <>
      {/* <SurveyModal /> */}
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap');`}</style>

      <div className=" bg-[#f5f5f8] font-[Outfit,sans-serif] text-[#1a1a2e]">
        {/* HEADER */}
        <motion.div
          className="border-b border-[#e8e8f0] bg-white px-4 py-6 sm:px-6 md:px-10 md:py-8"
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="mx-auto max-w-[1200px]">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-violet-200 bg-violet-50 px-3 py-1">
              <span className="h-[5px] w-[5px] rounded-full bg-violet-600" />
              <span className="text-[0.65rem] font-semibold uppercase tracking-widest text-violet-600">
                Employee Portal
              </span>
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight text-[#0f0f1a] sm:text-3xl">
              Dashboard
            </h1>
            <p className="mt-1 text-sm text-[#8888a0]">
              Welcome back, {TitleCase(user?.name) || "Employee"}
            </p>
          </div>
        </motion.div>

        <div className="mx-auto max-w-[1200px] px-4 py-6 sm:px-6 md:px-10 md:py-8">
          {/* SLIM STATS STRIP */}
          <motion.div
            className="mb-6 flex flex-wrap gap-2.5"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.div
              variants={itemVariants}
              className="inline-flex items-center gap-2 rounded-full border border-[#e8e8f0] bg-white py-1.5 pl-1.5 pr-4"
            >
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-violet-50">
                <Bell className="h-3.5 w-3.5 text-violet-600" />
              </span>
              <span className="text-sm">
                <span className="font-bold text-[#0f0f1a]">
                  {totalPendingActions}
                </span>{" "}
                <span className="text-[#9090a8]">pending</span>
              </span>
            </motion.div>

            <motion.div
              variants={itemVariants}
              className="inline-flex items-center gap-2 rounded-full border border-[#e8e8f0] bg-white py-1.5 pl-1.5 pr-4"
            >
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-50">
                <Briefcase className="h-3.5 w-3.5 text-indigo-600" />
              </span>
              <span className="text-sm">
                <span className="font-bold text-[#0f0f1a]">
                  {features.length}
                </span>{" "}
                <span className="text-[#9090a8]">services</span>
              </span>
            </motion.div>

            <motion.div
              variants={itemVariants}
              className="inline-flex items-center gap-2 rounded-full border border-[#e8e8f0] bg-white py-1.5 pl-1.5 pr-4"
            >
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-50">
                <Shield className="h-3.5 w-3.5 text-emerald-600" />
              </span>
              <span className="text-sm">
                <span className="font-bold text-emerald-600">Active</span>{" "}
                <span className="text-[#9090a8]">account</span>
              </span>
            </motion.div>
          </motion.div>

          {/* HERO: default is Time Tracker; hovering/focusing a carousel
              card below previews that service here instead. */}
          <motion.button
            type="button"
            onClick={() => navigate(heroFeature.path)}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.38, ease: "easeOut" }}
            title={heroFeature.tooltip || undefined}
            aria-label={
              heroFeature.tooltip
                ? `${heroFeature.title}: ${heroFeature.tooltip}`
                : heroFeature.title
            }
            style={
              {
                "--accent": heroFeature.accent,
                "--soft-bg": heroFeature.softBg,
              } as React.CSSProperties
            }
            className="group relative mb-8 w-full overflow-hidden rounded-3xl border border-[#e8e8f0] bg-white p-6 text-left transition-colors duration-300 hover:-translate-y-0.5 hover:border-[var(--accent)]/30 hover:shadow-[0_12px_40px_rgba(0,0,0,0.08)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 sm:p-10"
          >
            <div
              aria-hidden
              className="pointer-events-none absolute -right-10 -top-16 h-56 w-56 rounded-full bg-[var(--soft-bg)] opacity-70 blur-2xl transition-colors duration-300"
            />
            <AnimatePresence mode="wait">
              <motion.div
                key={heroFeature.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.22, ease: "easeOut" }}
                className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex items-start gap-4 sm:gap-5">
                  <div className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[var(--soft-bg)] transition-transform duration-200 group-hover:scale-105 sm:h-16 sm:w-16">
                    <heroFeature.icon className="h-6 w-6 text-[var(--accent)] sm:h-7 sm:w-7" />
                  </div>
                  <div>
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      <span className="text-[0.65rem] font-bold uppercase tracking-widest text-[var(--accent)] opacity-80">
                        {heroFeature.label}
                      </span>
                      {heroFeature.notification > 0 && (
                        <span className="rounded-full border border-red-200 bg-red-50 px-2 py-0.5 text-[0.6rem] font-bold uppercase tracking-wide text-red-600">
                          {heroFeature.notification} pending
                        </span>
                      )}
                      {heroFeature.exclamation && !heroFeature.notification && (
                        <span className="rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[0.6rem] font-bold uppercase tracking-wide text-amber-600">
                          Action needed
                        </span>
                      )}
                    </div>
                    <h2 className="text-xl font-extrabold tracking-tight text-[#0f0f1a] sm:text-2xl">
                      {heroFeature.title}
                    </h2>
                    <p className="mt-1.5 max-w-md text-sm text-[#8888a0]">
                      {heroFeature.description}
                    </p>
                  </div>
                </div>

                <div
                  className="inline-flex items-center gap-2 self-start rounded-xl px-5 py-3 text-sm font-bold text-white transition-transform duration-200 group-hover:translate-x-1 sm:self-auto"
                  style={{ backgroundColor: heroFeature.accent }}
                >
                  Open
                  <ArrowUpRight className="h-4 w-4" />
                </div>
              </motion.div>
            </AnimatePresence>
          </motion.button>

          {/* SECTION LABEL */}
          <div className="mb-4 flex items-center justify-between">
            <span className="text-[0.68rem] font-bold uppercase tracking-widest text-[#9090a8]">
              All services
            </span>
            <span className="text-xs text-[#c0c0d0]">
              Swipe or use the arrows
            </span>
          </div>

          {/* FEATURES: carousel */}
          <div className="relative">
            {/* edge fades hint there's more to scroll */}
            <div className="pointer-events-none absolute bottom-0 left-0 top-0 z-10 w-8 bg-gradient-to-r from-[#f5f5f8] to-transparent sm:w-12" />
            <div className="pointer-events-none absolute bottom-0 right-0 top-0 z-10 w-8 bg-gradient-to-l from-[#f5f5f8] to-transparent sm:w-12" />

            <button
              type="button"
              onClick={() => scrollByCard(-1)}
              disabled={activeIndex === 0}
              aria-label="Scroll to previous service"
              className="absolute left-0 top-1/2 z-20 hidden h-9 w-9 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-[#e8e8f0] bg-white text-[#6060a0] shadow-md transition hover:bg-[#f8f8fb] disabled:cursor-not-allowed disabled:opacity-30 sm:flex"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => scrollByCard(1)}
              disabled={activeIndex === carouselFeatures.length - 1}
              aria-label="Scroll to next service"
              className="absolute right-0 top-1/2 z-20 hidden h-9 w-9 -translate-y-1/2 translate-x-1/2 items-center justify-center rounded-full border border-[#e8e8f0] bg-white text-[#6060a0] shadow-md transition hover:bg-[#f8f8fb] disabled:cursor-not-allowed disabled:opacity-30 sm:flex"
            >
              <ChevronRight className="h-4 w-4" />
            </button>

            <motion.div
              ref={carouselRef}
              className="flex snap-x snap-mandatory gap-5 overflow-x-auto scroll-smooth pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {carouselFeatures.map((feature, index) => {
                const isPreviewed = feature.id === heroFeature.id;
                return (
                  <motion.button
                    key={feature.id}
                    ref={(el) => (cardRefs.current[index] = el)}
                    data-index={index}
                    type="button"
                    onClick={() => navigate(feature.path)}
                    onMouseEnter={() => setHoveredId(feature.id)}
                    onMouseLeave={() => setHoveredId(null)}
                    onFocus={() => setHoveredId(feature.id)}
                    onBlur={() => setHoveredId(null)}
                    variants={itemVariants}
                    whileHover={{ y: -6 }}
                    whileTap={{ scale: 0.97 }}
                    title={feature.tooltip || undefined}
                    aria-label={
                      feature.tooltip
                        ? `${feature.title}: ${feature.tooltip}`
                        : feature.title
                    }
                    style={
                      {
                        "--accent": feature.accent,
                        "--soft-bg": feature.softBg,
                      } as React.CSSProperties
                    }
                    className={`group relative flex h-[280px] w-[260px] shrink-0 snap-start flex-col rounded-2xl border bg-white p-6 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 sm:h-[300px] sm:w-[320px] md:w-[340px] ${
                      isPreviewed
                        ? "border-[var(--accent)]/40 shadow-[0_8px_28px_rgba(0,0,0,0.08)]"
                        : "border-[#e8e8f0] hover:border-[var(--accent)]/30"
                    }`}
                  >
                    <div className="mb-4 flex items-start justify-between">
                      <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--soft-bg)] transition-transform duration-200 group-hover:scale-110">
                        <feature.icon className="h-6 w-6 text-[var(--accent)]" />
                        {feature.notification > 0 && (
                          <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-[20px] items-center justify-center rounded-full border-2 border-white bg-red-600 px-1 text-[0.62rem] font-extrabold leading-none text-white">
                            {feature.notification}
                          </span>
                        )}
                        {feature.exclamation && !feature.notification && (
                          <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-[20px] items-center justify-center rounded-full border-2 border-white bg-amber-500 px-1 text-[0.62rem] font-extrabold leading-none text-white">
                            !
                          </span>
                        )}
                      </div>
                      <ArrowUpRight className="h-4 w-4 text-[#d8d8e8] transition-all duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-[var(--accent)]" />
                    </div>

                    <p className="mb-1.5 text-[0.65rem] font-bold uppercase tracking-widest text-[var(--accent)] opacity-80">
                      {feature.label}
                      {feature.id === DEFAULT_FEATURED_ID && (
                        <span className="ml-1.5 rounded-full bg-[var(--soft-bg)] px-1.5 py-0.5 text-[0.55rem] normal-case tracking-normal text-[var(--accent)] opacity-100">
                          Default
                        </span>
                      )}
                    </p>
                    <h3 className="mb-1.5 text-base font-bold text-[#1a1a2e] transition-colors group-hover:text-[var(--accent)]">
                      {feature.title}
                    </h3>
                    <p className="line-clamp-3 text-xs leading-relaxed text-[#9090a8]">
                      {feature.description}
                    </p>

                    <div className="mt-auto pt-4">
                      {feature.notification > 0 ? (
                        <span className="whitespace-nowrap rounded-full border border-red-200 bg-red-50 px-2 py-0.5 text-[0.6rem] font-bold uppercase tracking-wide text-red-600">
                          {feature.notification} new
                        </span>
                      ) : feature.exclamation ? (
                        <span className="whitespace-nowrap rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[0.6rem] font-bold uppercase tracking-wide text-amber-600">
                          Action needed
                        </span>
                      ) : null}
                    </div>
                  </motion.button>
                );
              })}
            </motion.div>
          </div>

          {/* DOT INDICATOR */}
          <div className="mt-4 flex items-center justify-center gap-1.5">
            {carouselFeatures.map((feature, index) => (
              <button
                key={feature.id}
                type="button"
                onClick={() => scrollToIndex(index)}
                aria-label={`Go to ${feature.title}`}
                aria-current={index === activeIndex}
                className="h-1.5 rounded-full transition-all duration-300"
                style={{
                  width: index === activeIndex ? 20 : 6,
                  backgroundColor:
                    index === activeIndex ? feature.accent : "#e0e0f0",
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default UserHome;
