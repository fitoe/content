(function($) {
	var j = {
		domain: document.domain,
		init: function(a, b) {
			var c;
			c = j.guid();
			var d = $('<div class="dropdown clearfix bootstrap-contextmenu"></div>');
			d.css({
				display: 'none',
				position: 'absolute'
			}).attr({
				id: c
			}).appendTo('body');
			$(a).data('e_id', c);
			$(a).data('e', $.extend(true, {},
			b));
			
			j.buildElements(a, d, b, true);
			j.create(a)
		},
		buildElements: function(a, b, c, d) {
			var f = $('<ul aria-labelledby="dropdownMenu" role="menu" class="dropdown-menu"></ul>');
			d = (d != undefined) ? d: true;
			if (d == true) {
				f.show()
			}
			
			for (var i in c) {
				var g = $('<li></li>');
				g.attr({
					id: i
				});
				switch (typeof c[i]) {
				case 'object':
					
					if (c[i].text != undefined) {
						if (c[i].text == '---') {
							g.addClass('divider')
						} else {
							var h = $('<a href="#" tabindex="-1"></a>');
							if (typeof c[i].icon == 'string') {
								g.append(h.append('<i class="fa ' + c[i].icon + '"> </i> ').append(c[i].text))
							} else {
								h = $('<a href="#" tabindex="-1">' + c[i].text + '</a>');
								g.append(h)
							}
							if (typeof c[i].click == 'function') {
								h.bind('mousedown', {
									key: i,
									target: a,
									callback: c[i].click
								},
								function(e) {
									if (!$(this).parent().hasClass('disabled')) {
										e.data.callback(e.data.target, $(this).parent())
									}
								})
							}
							if (c[i].disabled != undefined && c[i].disabled == true) {
								g.addClass('disabled')
							}
							if (typeof c[i].children == 'object') {
								if (!g.hasClass('disabled')) {
									g.addClass('dropdown-submenu');
									j.buildElements(a, g, c[i].children, false)
								}
							}
							if (g.hasClass('disabled')) {
								g.children('a').children('i').hide()
							}
						}
					}
					break;
				case 'string':
					if (c[i] == '---') {
						g.addClass('divider')
					} else {
						g.append($('<a href="#" tabindex="-1">' + c[i] + '</a>'))
					}
					break
				}
				f.append(g)
			}
			
			b.append(f)
		},
		create: function(c) {
			var f = $(c).data('e_id');
			$("#" + f).bind("contextmenu",
			function(e) {
				e.preventDefault()
			});
			$(c).mousedown(function(e) {
				$("#" + f).hide()
			});
			$(c).bind("contextmenu",
			function(e) {
				e.preventDefault()
			});
			$(document).mousedown(function(e) {
				$("#" + f).hide()
			});
			
			$(c).mousedown(function(e) {
				$('.bootstrap-contextmenu').hide();
				var b = e;
				if (b.button == 2) {
				e.stopPropagation();}
				$(this).mouseup(function(e) {
					if (b.button == 2) {e.stopPropagation();}
					$(this).unbind('mouseup');
					if (b.button == 2) {
						var d = {},
						x, y;
						if (self.innerHeight) {
							d.pageYOffset = self.pageYOffset;
							d.pageXOffset = self.pageXOffset;
							d.innerHeight = self.innerHeight;
							d.innerWidth = self.innerWidth
						} else if (document.documentElement && document.documentElement.clientHeight) {
							d.pageYOffset = document.documentElement.scrollTop;
							d.pageXOffset = document.documentElement.scrollLeft;
							d.innerHeight = document.documentElement.clientHeight;
							d.innerWidth = document.documentElement.clientWidth
						} else if (document.body) {
							d.pageYOffset = document.body.scrollTop;
							d.pageXOffset = document.body.scrollLeft;
							d.innerHeight = document.body.clientHeight;
							d.innerWidth = document.body.clientWidth
						} (e.pageX) ? x = e.pageX: x = e.clientX; (e.pageY) ? y = e.pageY: y = e.clientY;
						var a = $("#x-context-" + $(c).attr('id')).height();
						if (y + a > $(document).height()) {
							$("#" + f).css({

								top: y - a,
								left: x
							}).fadeIn(20)
						} else {
							$("#" + f).css({
								top: y,
								left: x
							}).fadeIn(20)
						}
					}
				})
			})
		},
		guid: function() {
			var a = function() {
				return Math.floor(Math.random() * 0x10000).toString(16)
			};
			return (a() + a() + "-" + a() + "-" + a() + "-" + a() + "-" + a() + a() + a())
		}
	};
	$.fn.contextMenu = function(a, b) {
		b = (b != undefined) ? b: '';
		if (typeof a == 'string' && b != '') {
			var c = $(this).data('e_id');
			var d = $(this).data('e');
			if (typeof c == 'string' && c != '') {
				var e = [];
				if (b.indexOf('>') > 0) {
					var f = b.split('>');
					for (var i in f) {
						e[e.length] = $.trim(f[i])
					}
				} else {
					e[e.length] = $.trim(b)
				}
				switch (a) {
				case 'disable':
					$('#' + c).remove();
					var g = d;
					var l = e.length - 1;
					for (var i in e) {
						if (g[e[i]] != undefined) {
							if (i == l) {
								g[e[i]].disabled = true
							} else {
								if (g[e[i]].children != undefined) {
									g = g[e[i]].children
								} else {
									break
								}
							}
						} else {
							break
						}
					}
					j.init(this, d);
					break;
				case 'enable':
					$('#' + c).remove();
					var g = d;
					var l = e.length - 1;
					for (var i in e) {
						if (g[e[i]] != undefined) {
							if (i == l) {
								g[e[i]].disabled = false
							} else {
								if (g[e[i]].children != undefined) {
									g = g[e[i]].children
								} else {
									break
								}
							}
						} else {
							break
						}
					}
					j.init(this, d);
					break
				}
			}
		} else if (typeof a == 'object') {
			return $(this).each(function() {
				j.init(this, a)
			})
		}
	}
})(jQuery);