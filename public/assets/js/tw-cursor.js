if ($("body").not(".is-mobile").hasClass("tw-magic-cursor")) {
  $(".tw-magnetic-item").wrap('<div class="tw-magnetic-wrap"></div>');

  if ($("a.tw-magnetic-item").length) {
    $("a.tw-magnetic-item").addClass("not-hide-cursor");
  }

  var $mouse = { x: 0, y: 0 }; // Cursor position
  var $pos = { x: 0, y: 0 }; // Cursor position
  var $ratio = 0.15; // delay follow cursor
  var $active = false;
  var $mouseMoved = false; // set by mousemove, cleared once the ball settles
  var $cursorShown = false; // CSS starts #magic-cursor hidden (opacity: 0)
  var $ball = $("#ball");

  var $ballWidth = 5; // Ball default width
  var $ballHeight = 5; // Ball default height
  var $ballScale = 1; // Ball default scale
  var $ballOpacity = 1; // Ball default opacity
  var $ballBorderWidth = 1; // Ball default border width

  gsap.set($ball, {
    // scale from middle and style ball
    xPercent: -50,
    yPercent: -50,
    width: $ballWidth,
    height: $ballHeight,
    borderWidth: $ballBorderWidth,
    opacity: $ballOpacity,
  });

  document.addEventListener("mousemove", mouseMove);

  function mouseMove(e) {
    $mouse.x = e.clientX;
    $mouse.y = e.clientY;
    $mouseMoved = true;
  }

  gsap.ticker.add(updatePosition);

  function updatePosition() {
    if ($active || !$mouseMoved) return;
    $pos.x += ($mouse.x - $pos.x) * $ratio;
    $pos.y += ($mouse.y - $pos.y) * $ratio;

    gsap.set($ball, { x: $pos.x, y: $pos.y });

    // The lerp has visually converged — skip the per-frame write until
    // the mouse moves again (sub-0.05px drift is imperceptible).
    if (Math.abs($mouse.x - $pos.x) + Math.abs($mouse.y - $pos.y) < 0.05) {
      $mouseMoved = false;
    }
  }

  // Show/hide magic cursor //

  // Hide on hover//
  $("a, button, .tw-cart-minus, .tw-cart-plus") // class "hide-cursor" is for global use.
    .not(".cursor-hide") // omit from selection.
    .on("mouseenter", function () {
      gsap.to($ball, { duration: 0.3, scale: 0, opacity: 0 });
    })
    .on("mouseleave", function () {
      gsap.to($ball, {
        duration: 0.3,
        scale: $ballScale,
        opacity: $ballOpacity,
      });
    });

  // Hide on click//
  $("a")
    .not('[target="_blank"]') // omit from selection.
    .not(".cursor-hide") // omit from selection.
    .not('[href^="#"]') // omit from selection.
    .not('[href^="mailto"]') // omit from selection.
    .not('[href^="tel"]') // omit from selection.
    .not(".lg-trigger") // omit from selection.
    .not(".tw-btn-disabled a") // omit from selection.
    .on("click", function () {
      gsap.to($ball, { duration: 0.3, scale: 1.3, autoAlpha: 0 });
    });

  // Show/hide on document leave/enter//
  $(document)
    .on("mouseleave", function () {
      $cursorShown = false;
      gsap.to("#magic-cursor", { duration: 0.3, autoAlpha: 0 });
    })
    .on("mouseenter", function () {
      $cursorShown = true;
      gsap.to("#magic-cursor", { duration: 0.3, autoAlpha: 1 });
    });

  // Show as the mouse moves//
  // PERF FIX: the original created a fresh GSAP tween on *every*
  // mousemove, even while the cursor was already visible. Only tween
  // when actually hidden — identical visuals, no tween churn on a
  // high-frequency event.
  $(document).mousemove(function () {
    if ($cursorShown) return;
    $cursorShown = true;
    gsap.to("#magic-cursor", { duration: 0.3, autoAlpha: 1 });
  });

  // Cursor view on hover (data attribute "data-cursor="...").
  // PERF FIX: the original called gsap.to(ball, ...) with an undefined
  // "ball" variable — a ReferenceError on every hover that also aborted
  // everything after it, including the mouseleave cleanup, so invisible
  // .ball-view divs piled up inside #ball forever. Those tweens never
  // executed anyway (.ball-view stays hidden via CSS: opacity:0,
  // visibility:hidden, scale(0)), so removing the dead calls keeps the
  // exact same visuals while fixing the exception and the DOM leak.
  $("[data-cursor]").each(function () {
    $(this)
      .on("mouseenter", function () {
        $("#ball").addClass("with-blur");
        $ball.append('<div class="ball-view"></div>');
        $(".ball-view").append($(this).attr("data-cursor"));
      })
      .on("mouseleave", function () {
        $ball.find(".ball-view").remove();
      });
    $(this).addClass("not-hide-cursor");
  });
}
