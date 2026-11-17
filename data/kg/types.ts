/**
 * Knowledge Graph of Tunisia Go (Lot 4). See docs/LOT4-FINAL-ARCHITECTURE.md.
 *
 * Every id is `prefix:key`, ASCII, lower case, never derived from a translated name and never renamed.
 * Places and road trips keep their current slugs (`place:<slug>`, `trip:<slug>`): no URL changes.
 */

export type Prefix =
  | 'country'
  | 'gov'
  | 'area'
  | 'place'
  | 'heritage'
  | 'designation'
  | 'ich'
  | 'polity'
  | 'person'
  | 'hevent'
  | 'festival'
  | 'trip'
  | 'candidate';

export type EntityId = `${Prefix}:${string}`;

export interface Labels {
  fr: string;
  en: string;
}

export type SourceId = string;

export interface KgSource {
  id: SourceId;
  label: string;
  /** Empty only for a printed or unavailable source. */
  url: string;
  level: 'institutional' | 'academic' | 'secondary';
  /** Date of the reading (YYYY-MM-DD). */
  consulted: string;
  /** Lot where it was read. */
  lot: string;
}

export interface KgEntity {
  id: EntityId;
  kind?: string;
  name: Labels;
  /** Arabic name, only with its source. */
  nameAr?: { text: string; source: SourceId };
  altNames?: string[];
  /** Official identifier (UNESCO number, Ramsar site number, decree…). */
  officialId?: string;
  /** Official page describing the entity (UNESCO, Ramsar…), read and checked. */
  officialUrl?: string;
  status: 'active' | 'draft' | 'retired';
  sources: SourceId[];
}

export type DesignationScheme = 'whc' | 'whc-tentative' | 'ramsar' | 'biosphere' | 'national-park';

export interface Designation extends KgEntity {
  kind: DesignationScheme;
  /** Year or date, only when an official source states it. */
  date?: string;
  dateSource?: SourceId;
}

export interface Heritage extends KgEntity {
  kind: 'mosque' | 'monument' | 'archaeological-site' | 'museum';
  /** The place page(s) that contain it. */
  in: EntityId[];
}

export interface Festival extends KgEntity {
  /** Place where the festival is held (`place:<slug>`). */
  place: EntityId;
  /** Id of the matching entry of data/events.ts (fallback data). */
  fileEventId: string;
  /** French titles the editions use in Supabase `events` (normalised comparison). */
  titlesFr: string[];
}

export type RelationType =
  | 'hasDesignation'
  | 'componentOf'
  | 'partOf'
  | 'ichPracticedIn'
  | 'builtBy'
  | 'foundedBy'
  | 'foundedIn'
  | 'associatedPolity'
  | 'affectedBy'
  | 'occurredAt'
  | 'associatedPerson'
  | 'namedAfter'
  | 'birthplaceOf'
  | 'suppliesWater'
  | 'protectedBy'
  | 'sameAs'
  | 'filmingLocationOf'
  | 'heldBy'
  | 'claim';

export type RelationStatus =
  | 'established'
  | 'partial'
  | 'secondary'
  | 'attributed'
  | 'unverified'
  | 'contradicted'
  | 'contested'
  | 'refuted';

export interface KgRelation {
  /** rel-01 … rel-75 come from the Lot 4 · 2B register; never renamed. */
  id: string;
  type: RelationType;
  from: EntityId;
  to: EntityId;
  /** Short statement of the relation, for the editorial register and the assistant. */
  statement: Labels;
  qualifiers?: { date?: string; role?: Labels };
  status: RelationStatus;
  sources: SourceId[];
  /** Reading date of the newest source used (YYYY-MM-DD). */
  checkedAt: string;
  /** Reserve, in French. */
  note?: string;
  /** Established, but only usable as text on the page (never as a relation, a fact or structured data). */
  textOnly?: true;
  /** Register relation whose established part this relation carries (e.g. rel-04 for rel-76). */
  partOfRegister?: string;
}

export interface Polity extends KgEntity {
  kind: 'dynasty' | 'people' | 'state';
}
