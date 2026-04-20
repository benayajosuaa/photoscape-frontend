type FontOptions = {
  variable?: string;
  [key: string]: unknown;
};

type FontResult = {
  className: string;
  variable: string;
};

function makeFontResult(options?: FontOptions): FontResult {
  return {
    className: "",
    variable: options?.variable ?? "",
  };
}

export function Montserrat(_options?: unknown): FontResult {
  return makeFontResult();
}

export function Geist(options?: FontOptions): FontResult {
  return makeFontResult(options);
}

export function Geist_Mono(options?: FontOptions): FontResult {
  return makeFontResult(options);
}
