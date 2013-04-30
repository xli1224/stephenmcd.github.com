
var _gaq = _gaq || [];
_gaq.push(['_setAccount', 'UA-52596-4']);
_gaq.push(['_trackPageview']);

(function() {
  var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
  ga.src = ('https:' == document.location.protocol ? 'https://ssl' : 'http://www') + '.google-analytics.com/ga.js';
  var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
})();

var bars = function(repos) {

  var normalize = function(s) {
    return s ? s.toLowerCase().replace(/-| /g, '') : '';
  };

  window.repos = window.repos || {};
  if (repos) {
    $.each(repos.data, function(i, repo) {
      window.repos[normalize(repo.name)] = repo;
    });
  }

  var watchers = 0, forks = 0;

  $('.projects li').each(function(i, project) {
    project = $(project);
    var pluralize = function(i) {
      return i != 1 ? 's' : '';
    };
    var text = project.find('a').text();
    var title = normalize(text);
    var abbr = $.map(text.split(' '), function(s, i) {
             return s.substr(0, 1).toLowerCase();
           }).join('');
    var repo = window.repos[title] || window.repos[abbr];
    if (repo) {
      var css = {width: (((repo.watchers + repo.forks) / 18) + 10) + 'px'};
      var tooltip = repo.watchers + ' watcher' + pluralize(repo.watchers)
            + ', ' + repo.forks + ' fork' + pluralize(repo.forks);
      var bar = $('<a>').addClass('bar').css(css).attr('title', tooltip);
      $(project).append(bar);
      watchers += repo.watchers;
      forks += repo.forks;
    }
  });

  $('.bar').click(function() {
    return false;
  }).tooltip({placement: 'right', animate: false});

};

var pageLoad = function(initial) {
  $('code[class=\'html+django\']').attr('class', 'html-django');
  if (!initial) {
    _gaq.push(['_trackPageview']);
    bars();
  }
  var cw = $('#coderwall');
  if (cw.length == 1 && cw.find('img').length == 0) {
    coderwall();
  }
};

$(function() {
  var src = 'https://api.github.com/users/stephenmcd/repos?callback=bars';
  $('head').append($('<script>').attr('src', src));
  $('head').append($('<script>').attr('src', src + "&page=2"));
  pageLoad(true);
});
