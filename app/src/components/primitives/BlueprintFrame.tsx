// The 4 corner registration marks every `.blueprint` element wears
// (Scout Hub.dc.html: <i class="corner tl/tr/bl/br">, used ~25×).
// Render as the first child of any element already carrying className
// "blueprint" (optionally combined with "card"/"dialog"/etc).
export function BlueprintFrame() {
  return (
    <>
      <i className="corner tl" />
      <i className="corner tr" />
      <i className="corner bl" />
      <i className="corner br" />
    </>
  );
}
