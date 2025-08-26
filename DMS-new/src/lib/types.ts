export interface DocumentType {
  id: number;
  label: string;
}

export interface NavItem {
  id: number;
  label: string;
  icon?: React.ComponentType;
  active?: boolean;
  link?: string;
  hasDropdown?: boolean;
}

export interface Card {
  title: string;
  count: number;
  icon: React.ReactNode;
  color: string;
}
