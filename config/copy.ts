/**
 * Gendered-term / partner-reference dictionary — Section 2.3.
 * Components never hardcode partner pronouns; they read them from here. The launch
 * audience is men and the default partner reference is she/her. Questions may
 * override per item in their own data (Session 2+).
 */
export interface PartnerTerms {
  /** "she" */
  subject: string;
  /** "her" (as in "texting her") */
  object: string;
  /** "her" (as in "her profile") */
  possessive: string;
}

export interface AudienceCopy {
  audience: string;
  partner: PartnerTerms;
}

export const copy: AudienceCopy = {
  audience: "men",
  partner: {
    subject: "she",
    object: "her",
    possessive: "her",
  },
};
