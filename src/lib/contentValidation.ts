export function isNonEmptyString(value: unknown): boolean {
  return typeof value === "string" && value.trim().length > 0;
}

export function isPositiveNumber(value: unknown): boolean {
  return typeof value === "number" && value > 0;
}

export function isNonEmptyArray<T>(value: unknown): value is T[] {
  return Array.isArray(value) && value.length > 0;
}

// Additional validation helpers for text segments
export function isValidTextSegment(segment: any): boolean {
  return (
    segment &&
    typeof segment === "object" &&
    isNonEmptyString(segment.text) &&
    (!segment.weight || typeof segment.weight === "string") &&
    (!segment.color || typeof segment.color === "string")
  );
}

export function isValidTextSegmentArray(segments: unknown): boolean {
  if (!Array.isArray(segments)) return false;
  return segments.every(segment => isValidTextSegment(segment));
}

export function isValidTextSegmentArrayArray(segmentsArray: unknown): boolean {
  if (!Array.isArray(segmentsArray)) return false;
  return segmentsArray.every(segments => isValidTextSegmentArray(segments));
}

// In contentValidation.ts, update the isValidProgramItem function:

export function isValidProgramItem(item: any): boolean {
  return (
    item &&
    typeof item === "object" &&
    isNonEmptyString(item.title) &&
    isNonEmptyString(item.description) &&
    isNonEmptyString(item.image)
    // isNonEmptyString(item.bgColor) // REMOVE THIS LINE
  );
}

export function isValidTestimonialItem(item: any): boolean {
  return (
    item &&
    typeof item === "object" &&
    isNonEmptyString(item.name) &&
    isNonEmptyString(item.title) &&
    isNonEmptyString(item.text) &&
    isNonEmptyString(item.splatterImage)
  );
}

export function isValidFeaturedProject(project: any): boolean {
  return (
    project &&
    typeof project === "object" &&
    isNonEmptyString(project.title) &&
    isValidTextSegmentArray(project.content)
  );
}

export function isValidRightNumber(number: any): boolean {
  return (
    number &&
    typeof number === "object" &&
    isNonEmptyString(number.label) &&
    isNonEmptyString(number.value)
  );
}

export function isValidBoardMember(member: any): boolean {
  return (
    member &&
    typeof member === "object" &&
    isNonEmptyString(member.name) &&
    isNonEmptyString(member.role) &&
    isNonEmptyString(member.image)
  );
}