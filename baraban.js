let methods = {
	init: function (opts) {
		// Создаём настройки по-умолчанию, расширяя их с помощью параметров, которые были переданы
		let settings = $.extend({
				isPeriodic: false,
				defaultValue: false,
				source: false,
				width: false
			}, opts),
			$this = $(this),
			data = $this.data('baraban'); //Получаем данные плангина

		// Если плагин ещё не проинициализирован инициализируем
		if (!data) {
			$this.data('baraban.init', false);
			$this.data('baraban', {
				settings,
				items: false,
				value: 0,
				current: 0,
				wrapper: false,
				barabanItems: {
					prev_hide: false,
					prev: false,
					active: false,
					next: false,
					next_hide: false
				},
				onInit: $.noop,
				onChange: $.noop,
				getItem: function (current, offset) {
					let items = this.items;
					let id = current + offset;
					if (settings.isPeriodic && (id < 0 || id > items.length - 1)) {
						if (id < 0) {
							id = items.length + id;
						} else if (id > items.length - 1) {
							id = id - items.length;
						}
					}
					return items[id] ? {
						current: id,
						name: items[id],
						value: id
					} : false;
				}
			});
			data = $this.data('baraban');

			//Обертка
			const $wrapper = $(this).addClass('bbn_wrapper');
			if (settings.width) {
				if ($.inArray(settings.width, ['skinny', 'slim', 'plump', 'fat']) >= 0) {
					$wrapper.addClass(settings.width);
				} else {
					if (typeof settings.width == 'number') {
						settings.width += 'px';
					}
					$wrapper.css('width', settings.width);
				}
			}
			data.wrapper = $wrapper;

			const $items_wrapper = $('<div/>', {
				class: "bbn_items_wrapper"
			}).appendTo($wrapper);

			//Полосочки :3
			$('<div/>', {
				class: 'bbn_line_up'
			}).appendTo($wrapper);
			$('<div/>', {
				class: 'bbn_line_down'
			}).appendTo($wrapper);

			//Парс генератора
			if (typeof opts.source === 'function') {
				data.getItem = opts.source;
			} else {
				data.items = opts.source;
			}

			//$wrapper.append($items);
			$wrapper.on('wheel', (e) => {
				e.preventDefault();
				if (e.originalEvent.deltaY > 0) {
					$this.baraban('next');
				} else {
					$this.baraban('prev');
				}
			});
			let touch_start = false,
				last_offset = false,
				current = 0;
			$wrapper.on('touchstart', function (event) {
				if(event.touches.length > 1) {
					return false;
				}
				$items_wrapper.addClass('block_animate');
				const $target = $(event.target);
				$target.data('detach_protection', true);
				touch_start = last_offset = event.targetToucheps[0].pageY;
			});
			$wrapper.on('touchend touchcancel', function (event) {
				if (touch_start) {
					$items_wrapper.removeClass('block_animate');
					const $target = $(event.target);
					if ($target.data('must_die')) {
						$target.remove();
					} else {
						$target.data('detach_protection', false);
					}
					$items_wrapper.animate({top: ""},100);
					touch_start = last_offset = false;
					current = 0;
					settings.onChange(data.value);
				}
			});
			$wrapper.on("touchmove", function (event) {
				if(event.touches.length > 1) {
					return false;
				}
				event.preventDefault();
				if (touch_start) {
					let touchY = event.targetTouches[0].pageY;
					let curr_min = -24 + 48 * current,
						curr_max = curr_min + 48;
					if (touch_start - touchY > curr_max) {
						$this.baraban('next', true);
						current++;
					} else if (touch_start - touchY < curr_min) {
						$this.baraban('prev', true);
						current--;
					} else if (Math.abs(touchY - last_offset) > 5) {
						$items_wrapper.css("top",`+=${(touchY - last_offset)}px`);
						last_offset = touchY;
					}

				}
			});
			//Задание default значение
			this.baraban('setValue', settings.defaultValue, 0);
			$this.data('baraban.init', true);
		}

		return this
	},
	getValue: function () { // TODO nada?
		return $(this).data('baraban').value;
	},

	setValue: function (current, offset = 0, force = false, items = {}) {
		const $this = $(this);
		let data = $this.data('baraban');
		if (!Object.keys(items).length && data.barabanItems.active) {
			for (let i in data.barabanItems) {
				$(data.barabanItems[i]).remove();
			}
		}
		if (!current) {
			current = 0
		}
		const $wrapper = data.wrapper.find('.bbn_items_wrapper');
		const $item = items.active || this.baraban('getItem', current, offset);
		if (!$item) {
			return false;
		}
		current = $item.data('current');
		const $prev_item = items.prev || this.baraban('getItem', current, -1);
		const $prev_hide_item = items.prev_hide || $prev_item && this.baraban('getItem', $prev_item.data('current'), -1);
		const $prev_detach_item = items.prev_detach/* || $prev_hide_item && this.baraban('getItem', $prev_hide_item.data('current'), -1)*/;
		const $next_item = items.next || this.baraban('getItem', $item.data('current'), +1);
		const $next_hide_item = items.next_hide || $next_item && this.baraban('getItem', $next_item.data('current'), +1);
		const $next_detach_item = items.next_detach/* || $next_hide_item && this.baraban('getItem', $next_hide_item.data('current'), +1)*/;
		data.current = current;
		data.value = $item.data('value');
		data.barabanItems.active = $item;
		if ($item.parent().length === 0) {
			$wrapper.prepend($item);
		}
		$item.addClass('bbn_active').removeClass('bbn_next bbn_prev bbn_next_hide bbn_prev_hide');
		if ($prev_item) {
			data.barabanItems.prev = $prev_item;
			if ($prev_item.parent().length === 0) {
				$wrapper.prepend($prev_item);
			}
			$prev_item.addClass('bbn_prev').removeClass('bbn_active bbn_prev_hide bbn_next bbn_next_hide');

		} else {
			data.barabanItems.prev = false;
		}

		if ($next_item) {
			data.barabanItems.next = $next_item;
			if ($next_item.parent().length === 0) {
				$wrapper.append($next_item);
			}
			$next_item.addClass('bbn_next').removeClass('bbn_active bbn_next_hide bbn_prev bbn_prev_hide');
		} else {
			data.barabanItems.next = false;
		}
		if ($prev_hide_item) {
			data.barabanItems.prev_hide = $prev_hide_item;
			if ($prev_hide_item.parent().length === 0) {
				$wrapper.prepend($prev_hide_item);
				if($wrapper.css("top") !== "0px" && $wrapper.css("top") !== "") {
					$wrapper.css("top","-=48px");
				}
			}
			$prev_hide_item.addClass('bbn_prev_hide').removeClass('bbn_prev bbn_active bbn_next bbn_next_hide');
		} else {
			data.barabanItems.prev_hide = false;
		}
		if ($next_hide_item) {
			data.barabanItems.next_hide = $next_hide_item;
			if ($next_hide_item.parent().length === 0) {
				$wrapper.append($next_hide_item);
			}
			$next_hide_item.addClass('bbn_next_hide').removeClass('bbn_next bbn_active bbn_prev bbn_prev_hide');
		} else {
			data.barabanItems.next_hide = false;
		}

		if ($prev_detach_item) {
			if ($prev_detach_item.parent().length !== 0) {
				if ($prev_detach_item.data('detach_protection')) {
					$prev_detach_item.data('must_die', true);
				} else {
					$prev_detach_item.remove();
				}

				if($wrapper.css("top") !== "" && $wrapper.css("top") !== "0px") {
					$wrapper.css("top","+=48px");
				}
			}
		}
		if ($next_detach_item) {
			if ($next_detach_item.parent().length !== 0) {
				if ($next_detach_item.data('detach_protection')) {
					$next_detach_item.data('must_die', true);
				} else {
					$next_detach_item.remove();
				}
			}
		}
		if ($this.data('baraban.init')) {
			if (!force) {
				data.settings.onChange($item.data('value'));
			}
		} else {
			data.settings.onInit($item.data('value'));
		}
		return this;
	},

	getItem: function (current, offset = 0) {
		const data = $(this).data('baraban');
		let item_data = data.getItem(current, offset);
		if (typeof item_data.current === 'undefined') {
			item_data.current = current + offset
		}

		return this.baraban('createItem', item_data);
	},

	next: function (force = false) {
		let data = $(this).data('baraban');
		if (data.barabanItems.next) {
			this.baraban('setValue', data.current, +1, force, {
				active: data.barabanItems.next,
				next: data.barabanItems.next_hide,
				prev: data.barabanItems.active,
				prev_hide: data.barabanItems.prev,
				prev_detach: data.barabanItems.prev_hide
			});
		}
		return this
	},
	prev: function (force = false) {
		let data = $(this).data('baraban');
		if (data.barabanItems.prev) {

			this.baraban('setValue', data.current, -1, force, {
				active: data.barabanItems.prev,
				next: data.barabanItems.active,
				prev: data.barabanItems.prev_hide,
				next_hide: data.barabanItems.next,
				next_detach: data.barabanItems.next_hide
			});
		}
		return this
	},
	createItem: function (data) {
		if (!data) {
			return false;
		}
		let {current, name, value} = data;
		const $this = $(this);
		if (!current) {
			current = value
		}
		return $('<div/>', {
			class: 'bbn_item',
			text: name,
			"data-value": value,
			"data-current": current
		}).on('click', function () {
			const $clicked = $(this);
			if ($clicked.hasClass('bbn_next')) {
				$this.baraban('next');
			}
			if ($clicked.hasClass('bbn_prev')) {
				$this.baraban('prev');
			}
		});
	}
};

$.fn.baraban = function (method) {
	if (methods[method]) {
		return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
	} else if (typeof method === 'object' || !method) {
		return methods.init.apply(this, arguments);
	} else {
		$.error('Метод с именем ' + method + ' не существует для jQuery.baraban');
	}

};
