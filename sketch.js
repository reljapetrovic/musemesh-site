// musemesh - ripple background. p5.js global mode.
// Normative parameters: spec 6 of
// docs/superpowers/specs/2026-07-12-musemesh-website-design.md, amended by
// spec 4 of docs/superpowers/specs/2026-07-16-musemesh-site-round2-design.md
// (round 2: black bg, ALL-white monochrome inks, halved dot alphas) and
// docs/superpowers/specs/2026-07-16-musemesh-free-for-now-design.md
// (round 3: draw() reads data-theme per frame - light inverts bg/ink).
var RING_INTERVAL_MS = 2300; // one new ring every 2.3 s
var RING_COUNT = 5;          // concurrent rings
var CROSS_SECONDS = 10;      // a ring crosses the screen in ~10 s
var GLOW_BAND_PX = 22;       // activation band around the wavefront
var DOT_AREA_PX2 = 12000;    // one dot per this much viewport area
var DOT_MIN = 24, DOT_MAX = 56;

var dots = [];
var maxR = 0;
var reduced = false;

function seedDots() {
  dots = [];
  var n = Math.round(constrain((width * height) / DOT_AREA_PX2, DOT_MIN, DOT_MAX));
  for (var i = 0; i < n; i++) {
    dots.push({
      x: random(12, width - 12),
      y: random(12, height - 12)
    });
  }
  maxR = Math.sqrt(width * width + height * height) / 2 + 40;
}

function setup() {
  var cnv = createCanvas(windowWidth, windowHeight);
  // p5 appends the canvas to the first <main> if one exists -- here that is
  // .win (position:relative; z-index:1), whose stacking context would paint
  // the canvas OVER the window text. Re-parent to <body> so the z-index
  // contract (.win at 1, canvas at 0) actually holds.
  cnv.parent(document.body);
  cnv.position(0, 0, 'fixed');
  cnv.style('z-index', '0');
  cnv.style('pointer-events', 'none');
  frameRate(30);
  seedDots();
  reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduced) noLoop(); // draw() still runs once -> static frame
}

function draw() {
  var light = document.documentElement.getAttribute('data-theme') === 'light';
  var bgc = light ? 255 : 0;
  var ink = light ? 0 : 255;
  background(bgc);
  var cx = width * 0.5, cy = height * 0.55;
  var speed = maxR / CROSS_SECONDS; // px per second
  var rings = [];
  if (!reduced) {
    var t = millis();
    for (var k = 0; k < RING_COUNT; k++) {
      var r = (((t + k * RING_INTERVAL_MS) % (RING_INTERVAL_MS * RING_COUNT)) / 1000) * speed;
      if (r < maxR) rings.push(r);
    }
  }

  noFill();
  strokeWeight(1);
  rings.forEach(function (r) {
    stroke(ink, ink, ink, 255 * 0.07 * (1 - r / maxR));
    circle(cx, cy, r * 2);
  });

  noStroke();
  fill(ink, ink, ink, 255 * 0.4);
  circle(cx, cy, 5); // the source

  dots.forEach(function (d) {
    var dist = Math.hypot(d.x - cx, d.y - cy);
    var glow = 0;
    rings.forEach(function (r) {
      var e = Math.abs(dist - r);
      if (e < GLOW_BAND_PX) glow = Math.max(glow, 1 - e / GLOW_BAND_PX);
    });
    fill(ink, ink, ink, 255 * (0.1 + 0.325 * glow));
    circle(d.x, d.y, 2 * (2.5 + 3.2 * glow));
  });
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  seedDots();
  if (reduced) redraw(); // refresh the static frame at the new size
}
