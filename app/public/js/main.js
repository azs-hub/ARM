'use strict';

import { WelcomeAnim } from "./WelcomeAnim.js";
import { LogoAnim } from "./LogoAnim.js";
import { ArrowAnim } from "./ArrowAnim.js";

/*
** HELPER FUNCTIONS
*/
var setContainerHeight = function() {

  var body = document.body,
      html = document.documentElement;

  var testElements = document.getElementsByClassName('container__section');
  var testDivs = Array.prototype.filter.call(testElements, function(testElement){
      return testElement.nodeName === 'DIV';
  });
  for (var i in testDivs) {
    testDivs[i].style.height = html.clientHeight + 'px';
  }
}
$.fn.isInViewport = function() {
  var elementTop = $(this).offset().top;
  var elementBottom = elementTop + $(this).outerHeight();

  var viewportTop = $(window).scrollTop();
  var viewportBottom = viewportTop + $(window).height();

  return elementBottom > viewportTop && elementTop < viewportBottom;
};

var _welcomeAnim = new WelcomeAnim();
var _logoAnim = new LogoAnim("home__logo", 300);
var _projectLogo = new LogoAnim("project__logo", 100);
var _arrowAnim = new ArrowAnim();
var logoAnim_played = 0;

// $(window).scrollTop();
// set height
setContainerHeight();

$(document).ready(function() {
  setTimeout(function () {
    window.scrollTo(0,0);
    // $('body').addClass('noScroll');

    // Play welcome animation
    _welcomeAnim.play();

    // Play logo project
    _projectLogo.play();
    _projectLogo.logo_rotate_interv();
  }, 400);
});

// control on resize
$(window).on('resize scroll', function() {
    // Home part is visible but not project
    // Draw Logo if AnimLogo never played
    if ($('#home').isInViewport() && logoAnim_played === 0 && !$('#project').isInViewport()) {
    	logoAnim_played = 1;
      setTimeout(function () {
      	_logoAnim.draw();
        _logoAnim.logo_rotate_interv();
      	_arrowAnim.play();
        $('body').removeClass('noScroll');
        
      }, 800);

    }
});

