var coderwall = function() {

    var url = 'http://www.coderwall.com/stephenmcd';

    var show = function() {
        $.each(window.badges, function(i, item) {
            $("#coderwall").show();
            var img = $('<a href="' + url + '"><img src="' + item.badge +
                        '" alt="' + item.name + '" title="' + item.name +
                        ': ' + item.description + '"></a>');
            img.mouseover(function() {$(this).css('opacity', 0.6);});
            img.mouseout(function() {$(this).css('opacity', 1);});
            img.appendTo("#coderwall");
        });
    };

    if (window.badges) {
        show();
    } else {
        $.getJSON(url + '.json?callback=?', function(data) {
            window.badges = data.data.badges;
            show();
        });
    }

};