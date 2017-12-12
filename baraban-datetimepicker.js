const moment = require('moment');
moment.locale('ru');
function roundToStep(value, step) {
	return Math.round(value / step) * step;
}

function withinBounds(value, offset, min, max, isDisabled, step = 1) {
	while (
		typeof min === "number" && value < min ||
		typeof max === "number" && value > max ||
		isDisabled(value)
		) {
		if (typeof min === "number" && value < min ||
			typeof max === "number" && value > max) {
			if (typeof min === "number" && !(typeof max === "number") || typeof max === "number" && !(typeof min == "number")) {
				return false;
			}
			value = offset < 0 ? max : min;
		} else {
			if (offset < 0) {
				value -= step;
			} else {
				value += step;
			}
		}
	}
	return value;
}

const methods = {
	init: function (opts) {
		// Создаём настройки по-умолчанию, расширяя их с помощью параметров, которые были переданы
		const settings = $.extend(true, {
				date: {
					min: false, //string || moment
					max: false, //string || moment
					onChange: $.noop, //function (value) {},
					isDisabled: function (value) {
						return false
					},//Возвращает запрещен ли год
					render: $.noop, //function (value, $datePickers) {},//Позволяет к примеру подкрышивать определнные даты
				},
				time: {
					min: false, //string || moment
					max: false, //string || moment
					stepMinutes: 1,
					stepSeconds: 1,
					onChange: $.noop, //function (value) {}
					isDisabled: function (value) {
						return false
					},//Возвращает запрещена ли дата
					render: $.noop, //function (value, $timePickers) {},//Позволяет к примеру подкрышивать определнные времени (О_о)
				},
				format: 'DD-MMMM-YYYY HH-mm-ss',
				defaultValue: moment(), //moment || 'DATETIME'
				inline: false, //Выводить не в всплывающем окне
				class: '',
				resetButton: true,
				selectButton: true,
				hideOnSelect: true,
				hideOnReset: true,
				onReset: $.noop, //function () {},
				onCreate: $.noop, //function ($wrapper) {},
				onChange: $.noop, //function (moment) {},
				beforeShow: $.noop, //function ($wrapper) {},
				afterShow: $.noop, //function ($wrapper) {},
				onSelect: $.noop //function (value) {}//Нажатие на кнопку OK

			}, opts),
			$this = $(this);
		let	data = $this.data('bbn_datetimepicker'); //Получаем данные плангина

		// Если плагин ещё не проинициализирован инициализируем
		if (data) {
			return this
		}
		$this.data('bbn_datetimepicker', {
			//properties
			settings,
			wrapper: $('<div/>', {class: 'bbn_dtp_wrapper'}),
			overlay: (!settings.inline ? $('<div/>', {class: 'bbn_dtp_overlay'}) : false),
			dateBarabans: {
				yearPicker: {
					position: -1,
					baraban: false,
				},
				monthPicker: {
					position: -1,
					baraban: false,
				},
				dayPicker: {
					position: -1,
					baraban: false,
				}
			},
			timeBarabans: {
				hourPicker: {
					position: -1,
					baraban: false,
				},
				minutePicker: {
					position: -1,
					baraban: false,
				},
				secondPicker: {
					position: -1,
					baraban: false,
				}
			},
			value: moment(settings.defaultValue)
		});
		data = $this.data('bbn_datetimepicker');



		//Обертка
		const $wrapper = data.wrapper;
		settings.class && $wrapper.addClass(settings.class);
		if (settings.inline) {
			$wrapper.addClass('inline');
			if($this[0].nodeName === 'INPUT') {
				$this.attr("type","hidden");
			}

		} else {
			data.overlay.append($wrapper).on('click', function (e) {
				if (this !== e.target) {
					return false;
				}
				$this.bbn_datetimepicker('hide');
			});

		}

		//Event
		$this.on('click', function () {
			$this.bbn_datetimepicker('show');
		});
		if ($this[0].nodeName === 'INPUT') {
			$this.on('change', function (e) {
				$this.bbn_datetimepicker('setValue', $this.val());
			});
		}
		settings.onCreate($wrapper);
		if(settings.inline) {
			$this.bbn_datetimepicker('show');
		}
		return this
	},
	setValue: function (value, skip) {
		const $this = $(this);
		if (typeof value !== 'object' && value.length === 0) {
			$this.bbn_datetimepicker('reset');
			return false;
		}
		let data = $this.data('bbn_datetimepicker');
		value = moment(value, data.settings.format);
		if (value.format() === 'Invalid date') {
			console.warn('Invalid date');
			return false;
		}
		if (data.dateBarabans.yearPicker.baraban) {
			if (skip !== 'year') {
				const yearBaraban = data.dateBarabans.yearPicker.baraban;
				yearBaraban.baraban('setValue', value.year(), 0, true);
				data.value.year(yearBaraban.baraban('getValue'));
			} else {
				data.value.year(value.year());
			}
		}
		if (data.dateBarabans.monthPicker.baraban) {
			if (skip !== 'month') {
				const monthBaraban = data.dateBarabans.monthPicker.baraban;
				monthBaraban.baraban('setValue', value.month(), 0, true);
				data.value.month(monthBaraban.baraban('getValue'));
			} else {
				data.value.month(value.month());
			}
		}
		if (data.dateBarabans.dayPicker.baraban) {
			if (skip !== 'day') {
				const dayBaraban = data.dateBarabans.dayPicker.baraban;
				dayBaraban.baraban('setValue', value.date(), 0, true);
				data.value.date(dayBaraban.baraban('getValue'));
			} else {
				data.value.date(value.date());
			}
		}
		if (data.timeBarabans.hourPicker.baraban) {
			if (skip !== 'hour') {
				const hourBaraban = data.timeBarabans.hourPicker.baraban;
				hourBaraban.baraban('setValue', value.hour(), 0, true);
				data.value.hour(hourBaraban.baraban('getValue'));
			} else {
				data.value.hour(value.hour());
			}
		}
		if (data.timeBarabans.minutePicker.baraban) {
			if (skip !== 'minute') {
				const minuteBaraban = data.timeBarabans.minutePicker.baraban;
				minuteBaraban.baraban('setValue', value.minute(), 0, true);
				data.value.minute(minuteBaraban.baraban('getValue'));
			} else {
				data.value.minute(value.minute());
			}
		}
		if (data.timeBarabans.secondPicker.baraban && skip !== 'second') {
			if (skip !== 'second') {
				const secondBaraban = data.timeBarabans.secondPicker.baraban;
				secondBaraban.baraban('setValue', value.second(), 0, true);
				data.value.second(secondBaraban.baraban('getValue'));
			} else {
				data.value.second(value.second());
			}
		}
		// if (this.nodeName === 'INPUT') {
		// 	$this.val(value.format(data.settings.format));
		// }
		data.settings.onChange(data.value);
		return this
	},
	getValue: function () {
		return $(this).data('bbn_datetimepicker') && $(this).data('bbn_datetimepicker').value || null;
	},
	generate: function () {
		const $this = $(this);
		const data = $this.data('bbn_datetimepicker');
		const settings = data.settings;
		const $wrapper = data.wrapper;
		//Парсим формат даты и времени
		let dateFormat = settings.date && settings.format,
			$timePicker = false,
			$datePicker = false;

		function parseFormat(sym) {
			const reg = new RegExp(sym, 'g');
			let variable = false;
			if (dateFormat.match(reg)) {
				variable = dateFormat.match(reg).join('');
			} else {
				for (var i = 1; i < arguments.length; i++) {
					let find = arguments[i];
					variable = parseFormat(find);
					if(variable) {
						variable = variable.replace(new RegExp(find,'g'),sym);
						dateFormat = dateFormat.replace(new RegExp(find,'g'),sym);
						i = arguments.length;
					}
				}
			}
			return variable
		}
		const yearFormat = parseFormat('Y'),
			monthFormat = parseFormat('M'),
			dayFormat = parseFormat('D'),
			hourFormat = parseFormat('H','h'),
			minuteFormat = parseFormat('m','i'),
			secondFormat = parseFormat('s');

		if (data.settings.date.min) {
			data.settings.date.min = moment(data.settings.date.min);
		}
		if (data.settings.time.min) {
			data.settings.time.min = moment(data.settings.time.min);
		}
		if (data.settings.date.max) {
			data.settings.date.max = moment(data.settings.date.max);
		}
		if (data.settings.time.max) {
			data.settings.time.max = moment(data.settings.time.max);
		}

		//Datepicker
		if (yearFormat || monthFormat || dayFormat) {
			$datePicker = $('<div>', {
				class: 'bbn_dtp_datepicker'
			});
		}

		//Год
		if (yearFormat) {
			data.dateBarabans.yearPicker.position = dateFormat.indexOf(yearFormat);
			data.dateBarabans.yearPicker.baraban = $('<div/>', {
				class: 'bbn_dtp_year'
			}).baraban({
				defaultValue: data.value.year(),
				width: (yearFormat.length === 2 ? 'skinny' : 'slim'),
				onChange(value) {
					const month = data.value.month(),
						day = data.value.date(),
						newValue = data.value.year(value).month(month).date(day);
					$this.bbn_datetimepicker('setValue', newValue, 'year');
					data.settings.date.onChange(data.value);
					data.settings.date.render(data.value,$datePicker);
				},
				onInit(value) {
					data.value.year(value);
				},
				source: function (current, offset) {
					current += offset;
					const isDisabled = function (value) {
						const newValue = moment(data.value).year(value);
						return data.settings.date.isDisabled(newValue);
					};
					let	maxDate = false,
						minDate = false;
					if (data.settings.date.max) {
						maxDate = data.settings.date.max.year()
					}
					if (data.settings.date.min) {
						minDate = data.settings.date.min.year()
					}

					current = withinBounds(current, offset, minDate, maxDate,isDisabled);
					if(current === false) {
						return false;
					}
					let year = current;
					if (yearFormat.length === 2) {
						year = year.toString().slice(-2);
					}
					return {
						name: year,
						value: current,
						current: current,
						isDisabled
					}
				}
			});
		}

		//Месяц
		if (monthFormat) {
			let monthClass = false;
			if (monthFormat.length < 3) {
				monthClass = 'skinny'
			}
			if (monthFormat.length === 3) {
				monthClass = 'slim'
			}
			data.dateBarabans.monthPicker.position = dateFormat.indexOf(monthFormat);
			data.dateBarabans.monthPicker.baraban = $('<div/>', {
				class: 'bbn_dtp_month'
			}).baraban({
				defaultValue: data.value.month(),
				width: monthClass,
				onChange(value) {
					const day = data.value.date(),
						newValue = data.value.month(value).date(day);
					$this.bbn_datetimepicker('setValue', newValue, 'month');
					data.settings.date.onChange(data.value);
					data.settings.date.render(data.value,$datePicker);

				},
				onInit(value) {
					data.value.month(value);
				},
				source: function (current, offset) {
					const isDisabled = function (value) {
						const newValue = moment(data.value).month(value);
						return data.settings.date.isDisabled(newValue);
					};
					let min = 0,
						max = 11;
					if (data.settings.date.min && data.value.year() === data.settings.date.min.year()) {
						min = data.settings.date.min.month();
					}
					if (data.settings.date.max && data.value.year() === data.settings.date.max.year()) {
						max = data.settings.date.max.month();
					}
					current += offset;
					/*while (
						current < min ||
						current > max ||
						isDisabled(current)
						) {
						if (current < min || current > max) {
							current = (offset < 0 ? max : min);
						} else {

							if (offset < 0) {
								current -= 1;
							} else {
								current += 1;
							}
						}
					}*/
					current = withinBounds(current,offset,min,max,isDisabled);


					let month;
					if (monthFormat.length === 1) {
						month = current + 1;
					} else if (monthFormat.length === 2) {
						month = ('0' + (current + 1)).slice(-2);
					} else {
						month = moment().month(current).format(monthFormat)
					}
					return {
						name: month,
						current,
						value: current
					}
				}
			});
		}

		//День
		if (dayFormat) {
			data.dateBarabans.dayPicker.position = dateFormat.indexOf(dayFormat);
			data.dateBarabans.dayPicker.baraban = $('<div/>', {
				class: 'bbn_dtp_day'
			}).baraban({
				defaultValue: data.value.date(),
				width: 'skinny',
				onChange(value) {
					const newValue = data.value.date(value);
					$this.bbn_datetimepicker('setValue', newValue, 'day');
					data.settings.date.onChange(data.value);
					data.settings.date.render(data.value,$datePicker);
				},
				onInit(value) {
					data.value.date(value);
				},
				source: function (current, offset) {
					let min = 1,
						max = data.value.daysInMonth();
					const isDisabled = function (value) {
						const newValue = moment(data.value).date(value);
						return data.settings.date.isDisabled(newValue);
					};
					if (
						data.settings.date.min &&
						data.value.month() === data.settings.date.min.month() &&
						data.value.year() === data.settings.date.min.year()
					) {
						min = data.settings.date.min.date();
					}
					if (
						data.settings.date.max &&
						data.value.month() === data.settings.date.max.month() &&
						data.value.year() === data.settings.date.max.year()
					) {
						max = data.settings.date.max.date();
					}
					current = current + offset;
					/*while (
						current < min ||
						current > max ||
						isDisabled(current)
						) {
						if (current < min || current > max) {
							current = (offset < 0 ? max : min);
						} else {
							if (offset < 0) {
								current -= 1;
							} else {
								current += 1;
							}
						}
					}*/

					current = withinBounds(current,offset,min,max,isDisabled);

					let day = current;
					if (dayFormat.length > 1) {
						day = ('0' + day).slice(-2);
					}
					return {
						name: day,
						value: current,
						current
					}
				}
			});
		}

		//TimePicker
		if (hourFormat || minuteFormat || secondFormat) {
			$timePicker = $('<div/>', {
				class: 'bbn_dtp_timepicker'
			});
		}

		//Часы
		if (hourFormat) {
			data.timeBarabans.hourPicker.position = dateFormat.indexOf(hourFormat);
			data.timeBarabans.hourPicker.baraban = $('<div/>', {
				class: 'bbn_dtp_hours'
			}).baraban({
				defaultValue: data.value.hour(),
				width: 'skinny',
				onChange(value) {
					const minute = data.value.minute(),
						second = data.value.second(),
						newValue = data.value.hour(value).minute(minute).second(second);
					$this.bbn_datetimepicker('setValue', newValue, 'hour');
					data.settings.time.onChange(data.value);
					data.settings.time.render(data.value,$timePicker);
				},
				onInit(value) {
					data.value.hour(value);
				},
				source: function (current, offset) {
					const isDisabled = function (value) {
						const newValue = moment(data.value).hour(value);
						return data.settings.time.isDisabled(newValue);
					};
					let min = 0,
						max = 23;
					if (data.settings.time.min) {
						min = data.settings.time.min.hour();
					}
					if (data.settings.time.max) {
						max = data.settings.time.max.hour();
					}
					current += offset;
					/*while (
						current < min ||
						current > max ||
						isDisabled(current)
						) {
						if (current < min || current > max) {
							current = (offset < 0 ? max : min);
						} else {
							if (offset < 0) {
								current -= 1;
							} else {
								current += 1;
							}
						}
					}*/

					current = withinBounds(current,offset,min,max,isDisabled);
					let hour = current;
					if (hourFormat.length > 1) {
						hour = ('0' + hour).slice(-2);
					}
					return {
						name: hour,
						value: current,
						current: current
					}
				}
			});
		}
		//AM PM TODO AM PM ??

		//Минуты
		if (minuteFormat) {
			data.timeBarabans.minutePicker.position = dateFormat.indexOf(minuteFormat);
			data.timeBarabans.minutePicker.baraban = $('<div/>', {
				class: 'bbn_dtp_minutes'
			}).baraban({
				defaultValue: data.value.second(),
				width: 'skinny',
				onChange(value) {
					const second = data.value.second(),
						newValue = data.value.minute(value).second(second);
					$this.bbn_datetimepicker('setValue', newValue, 'minute');
					data.settings.time.onChange(data.value);
					data.settings.time.render(data.value,$timePicker);
				},
				onInit(value) {
					data.value.minute(value);
				},
				source: function (current, offset) {
					const step = settings.time.stepMinutes,
						isDisabled = function (value) {
							const newValue = moment(data.value).minute(value);
							return data.settings.time.isDisabled(newValue);
						};
					let value = current + offset * step,
						min = 0,
						max = 59;
					if (data.settings.time.min && data.value.hour() === data.settings.time.min.hour()) {
						min = data.settings.time.min.minute();
					}
					if (data.settings.time.max && data.value.hour() === data.settings.time.max.hour()) {
						max = data.settings.time.max.minute();
					}
					min = Math.ceil(min / step) * step;
					max = Math.floor(max / step) * step;
					value = roundToStep(value, step);
					/*while (
						value < min ||
						value > max ||
						isDisabled(value)
						) {
						if (value < min || value > max) {
							value = (offset < 0 ? max : min);
						} else {
							if (offset < 0) {
								value -= step;
							} else {
								value += step;
							}
						}
					}*/
					value = withinBounds(value,offset,min,max,isDisabled,step);

					let month = value;
					if (minuteFormat.length > 1) {
						month = ('0' + month).slice(-2);
					}
					return {
						name: month,
						value,
						current: value
					}
				}
			});
		}

		//Секунды
		if (secondFormat) {
			data.timeBarabans.secondPicker.position = dateFormat.indexOf(secondFormat);
			data.timeBarabans.secondPicker.baraban = $('<div/>', {
				class: 'bbn_dtp_seconds'
			}).baraban({
				defaultValue: data.value.second(),
				width: 'skinny',
				onChange(value) {
					const newValue = data.value.second(value);
					$this.bbn_datetimepicker('setValue', newValue, 'second');
					data.settings.time.onChange(data.value);
					data.settings.time.render(data.value,$timePicker);
				},
				onInit(value) {
					data.value.second(value);
				},
				source: function (current, offset) {
					const step = settings.time.stepSeconds,
						isDisabled = function (value) {
							const newValue = moment(data.value).second(value);
							return data.settings.time.isDisabled(newValue);
						};
					let value = current + offset * step,
						min = 0,
						max = 59;
					if (
						data.settings.time.min &&
						data.value.hour() === data.settings.time.min.hour() &&
						data.value.minute() === data.settings.time.min.minute()
					) {
						min = data.settings.time.min.second();
					}
					if (
						data.settings.time.max &&
						data.value.hour() === data.settings.time.max.hour() &&
						data.value.minute() === data.settings.time.max.minute()
					) {
						max = data.settings.time.max.second();
					}
					min = Math.ceil(min / step) * step;
					max = Math.floor(max / step) * step;
					value = roundToStep(value, step);
					/*while (
						value < min ||
						value > max ||
						isDisabled(value)
						) {
						if (value < min || value > max) {
							value = offset < 0 ? max : min;
						} else {
							if (offset < 0) {
								value -= step;
							} else {
								value += step;
							}
						}
					}*/

					value = withinBounds(value,offset,min,max,isDisabled,step);
					let second = value;
					if (secondFormat.length > 1) {
						second = ('0' + second).slice(-2);
					}
					return {
						name: second,
						value,
						current: value
					}
				}
			});
		}

		//Вывод заголовка
		const $header = $('<div/>', {class: 'bbn_dtp_header'}).prependTo($wrapper),
			$title = $('<div/>', {class: 'bbn_dtp_title'}).appendTo($header),
			$toggleBtn = (!($datePicker && $timePicker) ? false : $('<div/>', {
				class: 'bbn_dtp_toggle material-icon'
			})
				.appendTo($header)
				.attr('data-icon', 'access_time'));

		if ($datePicker) {
			$header.after($datePicker);
			$title.text('Дата');
		} else if ($timePicker) {
			$header.after($timePicker);
			$title.text('Время');
		}
		if ($toggleBtn) {
			$toggleBtn.on('click', function () {
				if ($toggleBtn.attr('data-icon') === 'access_time') {
					$toggleBtn.attr('data-icon', 'date_range');
					$title.text('Время');
					$datePicker.detach();
					$header.after($timePicker);
				} else {
					$toggleBtn.attr('data-icon', 'access_time');
					$title.text('Дата');
					$timePicker.detach();
					$header.after($datePicker);
				}
			});
		}

		//Вывод барабанов
		function appendBarabans(barabans, $wrapper) {
			let barabans_tmp = [];
			for (const key in barabans) {
				const {position, baraban} = barabans[key];
				if (position >= 0) {
					barabans_tmp[position] = baraban;
				}
			}
			barabans_tmp.forEach(function ($item) {
				$wrapper.append($item);
			});
		}

		if ($datePicker) {
			appendBarabans(data.dateBarabans, $datePicker);
		}
		if ($timePicker) {
			appendBarabans(data.timeBarabans, $timePicker);
		}
		//Кнопки
		const $buttonsWrapper = $('<div/>', {
			class: 'bbn_buttons_wrapper'
		}).appendTo($wrapper);
		if(settings.selectButton) {
			$('<button/>', {
				class: 'bbn_cancel_button',
				text: 'Отмена'
			}).on('click', function (e) {
				e.preventDefault();
				$this.bbn_datetimepicker('hide');
			}).appendTo($buttonsWrapper);
		}
		if (settings.resetButton) {
			$('<button/>', {
				class: 'bbn_reset_button',
				text: 'Сброс'
			}).on('click', function (e) {
				e.preventDefault();
				$this.bbn_datetimepicker('reset');
				if ($this[0].nodeName === 'INPUT') {
					$this.val(data.value.format(dateFormat));
				}
				if(settings.hideOnReset) {
					$this.bbn_datetimepicker('hide');
				}
				settings.onReset();
			}).appendTo($buttonsWrapper);
		}

		if(settings.selectButton) {
			$('<button/>', {
				class: 'bbn_accept_button',
				text: 'Ок'
			}).on('click', function (e) {
				e.preventDefault();
				const value = data.value;
				if ($this[0].nodeName === 'INPUT') {
					$this.val(value.format(dateFormat));
				}
				if(settings.hideOnSelect) {
					$this.bbn_datetimepicker('hide');
				}
				settings.onSelect(value);
			}).appendTo($buttonsWrapper);
		}
	},
	show: function () {
		const $this = $(this);
		const data = $this.data('bbn_datetimepicker');
			const $wrapper = data.wrapper;
			$wrapper.empty();
		data.settings.beforeShow($wrapper);
		$this.bbn_datetimepicker('generate');
		if (data.settings.inline) {

			if($this[0].nodeName === 'INPUT') {
				$this.parent().append($wrapper);
			} else {
				$this.append($wrapper);
			}
		} else {
			const value = $this.val() !== '' ? moment($this.val(),data.settings.format) : '';
			if (value !== '' && value.format() !== data.value.format()) {
				$this.bbn_datetimepicker('setValue', value);
			}
			$('body').append(data.overlay);
			$this.blur();
		}
		data.settings.afterShow($wrapper);
		return this;
	},
	hide: function () {
		const data = $(this).data('bbn_datetimepicker');
		if (data.settings.inline) {
			data.wrapper.detach();
		} else {
			data.overlay.detach();
		}
		return this;
	},
	destroy: function () { //TODO Destroy
		console.log('TODO Destroy');
	},
	reset: function () {
		const defaultValue = $(this).data('bbn_datetimepicker').settings.defaultValue;
		$(this).bbn_datetimepicker('setValue', defaultValue);
		return this;
	}
};
$.fn.bbn_datetimepicker = function (method) {
	if (methods[method]) {
		return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
	} else if (typeof method === 'object' || !method) {
		return methods.init.apply(this, arguments);
	} else {
		$.error('Метод с именем ' + method + ' не существует для jQuery.bbn_datetimepicker');
	}

};
