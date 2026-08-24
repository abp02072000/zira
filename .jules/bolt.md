## 2026-08-24 - Cache Intl formatters at module scope
**Learning:** Instantiating `Intl.NumberFormat` or `Intl.DateTimeFormat` inside utility functions creates new locale data parser instances on every invocation, causing significant execution overhead across high-frequency render loops.
**Action:** Always instantiate and reuse `Intl` formatters at module scope when formatting options are static.
