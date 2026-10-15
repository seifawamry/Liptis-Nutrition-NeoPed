/**
 * Liptis Nutrition NeoPed™ LBW Clinical Suite
 * Single Source of Truth for Application Versioning, Provenance, & Compliance Notices
 */

export const APP_VERSION = "v2.2.0";
export const APP_VERSION_LABEL = "v2.2.0 Reference";
export const ENGINE_VERSION = "NeoPed Engine v2.2.0 (Deterministic Reference Model)";

export const CLINICAL_GOVERNANCE = {
  appName: "Liptis Nutrition NeoPed™ LBW Clinical Suite",
  version: APP_VERSION,
  versionLabel: APP_VERSION_LABEL,
  engineVersion: ENGINE_VERSION,
  releaseDate: "2026-10-15",
  supportedStandards: [
    "ESPGHAN 2022 Preterm Enteral Nutrition Guidelines",
    "Fenton 2013 Preterm Growth Standards (22–50 weeks PMA)",
    "WHO Child Growth Standards 2006 (0–24 months Corrected Age)",
  ],
  privacyNotice:
    "No network transmission is intended by the calculation module; verify deployment, hosting, analytics, and browser telemetry configuration before institutional use.",
  fentonLicensingNotice:
    "Fenton 2013 reference implementation for institutional review; verify licensing and local clinical validation before clinical deployment.",
  whoAttribution:
    "World Health Organization (WHO) Child Growth Standards (2006) LMS tabulated parameters (0–24 months).",
  regulatoryNotice:
    "Clinical decision support reference calculation utility for licensed healthcare professionals. Not a medical device, autonomous diagnosis, prescription, medical order, or nutritional adequacy certification. Clinical judgment, individual infant tolerance, and serial monitoring supersede calculated values.",
};
