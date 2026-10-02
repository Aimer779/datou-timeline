export function portraitUrl(file: string, base = import.meta.env.BASE_URL): string {
  return `${base.endsWith('/') ? base : `${base}/`}year-frames/${file}`
}
