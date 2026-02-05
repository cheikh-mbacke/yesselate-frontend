/**
 * Configuration de navigation pour le module Calendrier & Planification v3.0
 * Structure hiérarchique complète avec routes, icônes et badges
 */

export type CalendrierNavItem = {
  label: string;
  icon?: string;
  route?: string;
  badgeKey?: string;        // ex: 'jalonsAtRiskCount'
  children?: CalendrierNavItem[];
};

export const calendrierNavigation: CalendrierNavItem[] = [
  {
    label: "Calendrier",
    icon: "CalendarDays",
    children: [
      {
        label: "Vue d'ensemble",
        icon: "LayoutDashboard",
        route: "/maitre-ouvrage/calendrier/vue-ensemble",
        children: [
          {
            label: "Calendrier global (Multi-chantiers)",
            route: "/maitre-ouvrage/calendrier/vue-ensemble/global"
          },
          {
            label: "Vue par chantier",
            route: "/maitre-ouvrage/calendrier/vue-ensemble/chantier"
          }
        ]
      },
      {
        label: "Gantt",
        icon: "GanttChart",
        children: [
          {
            label: "Global",
            route: "/maitre-ouvrage/calendrier/gantt/global"
          },
          {
            label: "Par chantier",
            route: "/maitre-ouvrage/calendrier/gantt/chantier"
          }
        ]
      },
      {
        label: "Timeline",
        icon: "History",
        children: [
          {
            label: "Global",
            route: "/maitre-ouvrage/calendrier/timeline/global"
          },
          {
            label: "Par chantier",
            route: "/maitre-ouvrage/calendrier/timeline/chantier"
          }
        ]
      }
    ]
  },
  {
    label: "Jalons & Contrats",
    icon: "Flag",
    badgeKey: "jalons_total_count",
    children: [
      {
        label: "Jalons SLA à risque",
        route: "/maitre-ouvrage/calendrier/jalons/sla-risque"
      },
      {
        label: "Jalons en retard",
        route: "/maitre-ouvrage/calendrier/jalons/retards"
      },
      {
        label: "Jalons à venir",
        route: "/maitre-ouvrage/calendrier/jalons/a-venir"
      }
    ]
  },
  {
    label: "Absences & Congés",
    icon: "UserMinus",
    children: [
      {
        label: "Vue globale",
        route: "/maitre-ouvrage/calendrier/absences/global"
      },
      {
        label: "Par équipe",
        route: "/maitre-ouvrage/calendrier/absences/equipe"
      },
      {
        label: "Par chantier",
        route: "/maitre-ouvrage/calendrier/absences/chantier"
      }
    ]
  },
  {
    label: "Événements & Réunions",
    icon: "CalendarClock",
    children: [
      {
        label: "Événements internes",
        route: "/maitre-ouvrage/calendrier/evenements/internes"
      },
      {
        label: "Réunions projets / chantiers",
        route: "/maitre-ouvrage/calendrier/evenements/reunions-projets"
      },
      {
        label: "Réunions décisionnelles",
        route: "/maitre-ouvrage/calendrier/evenements/reunions-decisionnelles"
      }
    ]
  }
];

