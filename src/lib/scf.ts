type PlainObject = Record<string, unknown>;

function isPlainObject(value: unknown): value is PlainObject {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export type WorkScfGroup =
  | (PlainObject & {
      title?: string | null;
      name?: string | null;
    })
  | null;

export type WorkScfCore = {
  fg_work?: WorkScfGroup;
  works?: WorkScfGroup;
  [key: string]: unknown;
};

export type WorkScfPayload = WorkScfCore | null | undefined;

function isWorkScfCore(value: unknown): value is WorkScfCore {
  return isPlainObject(value);
}

type WithScfPayload = {
  scf?: WorkScfPayload;
};

export function getWorkScfFields<T extends WithScfPayload>(
  work: T
): WorkScfPayload {
  return work.scf ?? null;
}

function pickGroupValue(
  group: WorkScfGroup | undefined,
  key: string
): string | null {
  if (!group || !isPlainObject(group)) return null;
  const value = group[key];
  return typeof value === "string" ? value : null;
}

function pickScfString(fields: WorkScfCore, key: string): string | null {
  const value = fields[key];
  return typeof value === "string" ? value : null;
}

export function getWorkScfTitle<T extends WithScfPayload>(
  work: T,
  scfFields: WorkScfPayload = getWorkScfFields(work)
): string | null {
  if (!isWorkScfCore(scfFields)) return null;
  const fgWork = scfFields.fg_work;
  const works = scfFields.works;

  const candidates = [
    pickGroupValue(fgWork, "title"),
    pickGroupValue(fgWork, "work_title"),
    pickGroupValue(works, "title"),
    pickGroupValue(works, "work_title"),
    pickScfString(scfFields, "fg_work_title"),
    pickScfString(scfFields, "works_title"),
    pickScfString(scfFields, "work_title"),
    pickScfString(scfFields, "work_title_en"),
    pickScfString(scfFields, "title"),
  ];

  for (const value of candidates) {
    if (value) return value;
  }
  return null;
}

export function getWorkScfName<T extends WithScfPayload>(
  work: T,
  scfFields: WorkScfPayload = getWorkScfFields(work)
): string | null {
  if (!isWorkScfCore(scfFields)) return null;
  const fgWork = scfFields.fg_work;
  const works = scfFields.works;

  const candidates = [
    pickGroupValue(fgWork, "name"),
    pickGroupValue(fgWork, "work_name"),
    pickGroupValue(works, "name"),
    pickGroupValue(works, "work_name"),
    pickScfString(scfFields, "fg_work_name"),
    pickScfString(scfFields, "works_name"),
    pickScfString(scfFields, "work_name"),
    pickScfString(scfFields, "name"),
  ];

  for (const value of candidates) {
    if (value) return value;
  }
  return null;
}
