(function ($) {
    $.fn.megaMenu = function (opts) {
        this.each(function () {
            init.call(this, opts);
        });
        return this;
    };

    function activateSubmenu(row) {
        var $row = $(row),
            $submenu = $row.children('.header-nav__subject-list');
        $('.header-nav__grade-list .header-nav__subject-list').css({
            display: "none"
        });
        $submenu.css({
            display: "block",
        });
    }

    function deactivateSubmenu(row) {
        var $row = $(row),
            $submenu = $row.children('.header-nav__grade-list');
        $submenu.css('display', 'none');
    }

    function exitSubMenu(row) {
        return true;
    }

    // Hàm khai báo cấu hình cho menu
    function init(opts) {
        var $menu = $(this),
            activeRow = null,
            mouseLocs = [],
            lastDelayLoc = null,
            timeoutId = null,
            options = $.extend({
                rowSelector: '> li',
                submenuSelector: '*',
                submenuDirection: 'below',
                tolerance: 3,
                enter: $.noop,
                exit: $.noop,
                activate: activateSubmenu,
                deactivate: deactivateSubmenu,
                exitMenu: exitSubMenu,
                delay: 300,
                mouseCancel: false
            }, opts);
        var MOUSE_LOCS_TRACKED = 3,
            DELAY = options.delay;
        // hàm lưu lại lịch sử tọa độ con trỏ chuột, lưu tối đa 3 row
        var mousemoveDocument = function (e) {
            mouseLocs.push({
                x: e.pageX,
                y: e.pageY
            });
            if (mouseLocs.length > MOUSE_LOCS_TRACKED) {
                mouseLocs.shift();
            }
        };
        var mouseleaveMenu = function () {
            if (timeoutId) {
                clearTimeout(timeoutId);
            }
            if (options.exitMenu(this)) {
                if (activeRow) {
                    options.deactivate(activeRow);
                }
                activeRow = null;
            }
        };
        var mouseenterRow = function () {
            if (options.mouseCancel) {
                return;
            }
            if (timeoutId) {
                clearTimeout(timeoutId);
            }
            options.enter(this);
            possiblyActivate(this);
        }, mouseleaveRow = function () {
            if (options.mouseCancel) {
                return;
            }
            options.exit(this);
        };
        var clickRow = function () {
            activate(this);
        };
        var activate = function (row) {
            if (row === activeRow) {
                return;
            }
            if (activeRow) {
                options.deactivate(activeRow);
            }
            options.activate(row);
            activeRow = row;
        };
        var possiblyActivate = function (row) {
            var delay = activationDelay();
            if (delay) {
                timeoutId = setTimeout(function () {
                    possiblyActivate(row);
                }, delay);
            } else {
                activate(row);
            }
        };
        var activationDelay = function () {
            if (!activeRow || !$(activeRow).is(options.submenuSelector)) {
                return 0;
            }
            var offset = $menu.offset(),
                upperLeft = {
                    x: offset.left,
                    y: offset.top - options.tolerance
                },
                upperRight = {
                    x: offset.left + $menu.outerWidth(),
                    y: upperLeft.y
                },
                lowerLeft = {
                    x: offset.left,
                    y: offset.top + $menu.outerHeight() + options.tolerance
                },
                lowerRight = {
                    x: offset.left + $menu.outerWidth(),
                    y: lowerLeft.y
                },
                loc = mouseLocs[mouseLocs.length - 1],
                prevLoc = mouseLocs[0];

            if (!loc) {
                return 0;
            }
            if (!prevLoc) {
                prevLoc = loc;
            }
            if (prevLoc.x < offset.left || prevLoc.x > lowerRight.x || prevLoc.y < offset.top || prevLoc.y > lowerRight.y) {
                return 0;
            }
            if (lastDelayLoc && loc.x == lastDelayLoc.x && loc.y == lastDelayLoc.y) {
                return 0;
            }

            function slope(a, b) {
                return (b.y - a.y) / (b.x - a.x);
            };
            var decreasingCorner = upperRight,
                increasingCorner = lowerRight;
            if (options.submenuDirection === 'left') {
                decreasingCorner = lowerLeft;
                increasingCorner = upperLeft;
            } else if (options.submenuDirection === 'below') {
                decreasingCorner = lowerRight;
                increasingCorner = lowerLeft;
            } else if (options.submenuDirection === 'above') {
                decreasingCorner = upperLeft;
                increasingCorner = upperRight;
            }
            var decreasingSlope = slope(loc, decreasingCorner),
                increasingSlope = slope(loc, increasingCorner),
                prevDecreasingSlope = slope(prevLoc, decreasingCorner),
                prevIncreasingSlope = slope(prevLoc, increasingCorner);
            if (decreasingSlope < prevDecreasingSlope && increasingSlope > prevIncreasingSlope) {
                lastDelayLoc = loc;
                return DELAY;
            }
            lastDelayLoc = null;
            return 0;
        };
        // hàm khởi tạo sự kiện khi di chuyển vào và di chuyển ra khỏi vùng menu
        $menu.mouseleave(mouseleaveMenu)
            .find(options.rowSelector)
            .mouseenter(mouseenterRow)
            .mouseleave(mouseleaveRow)
            .click(clickRow);
        $(document).mousemove(mousemoveDocument);
    }
})(jQuery);

$(document).ready(function () {
    $('.header-nav__grade-list').megaMenu({
        mouseCancel: (window.innerWidth < 992),
        activate: function (row) {
            var $row = $(row),
                $submenu = $row.children('.header-nav__subject-list'),
                $ref = $submenu.parents('.header-nav__grade-list').find('> li > a');
            $submenu.parents('.header-nav__grade-list').find('.header-nav__subject-list').css({
                display: 'none'
            });
            $submenu.css({
                display: 'block'
            });
        },
        deactivate: function (row) {
            var $row = $(row),
                $submenu = $row.children('.header-nav__subject-list'),
                $ref = $submenu.parents('.header-nav__grade-list').find('> li > a');
            $submenu.css('display', 'none');
        }
    });
});