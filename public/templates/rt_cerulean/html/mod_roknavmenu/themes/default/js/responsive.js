((function(){

	var ResponsiveMenu = this.ResponsiveMenu = new Class({
		initialize: function(){
			this.build();
			this.attachEvents();
			this.mediaQuery(RokMediaQueries.getQuery());
		},

		build: function(){
			if (this.toggler) return this.toggler;
			this.toggler = new Element('div.gf-menu-toggle').inject(document.id('rt-top') || document.body);

			(3).times(function(i){
				new Element('span.icon-bar').inject(this.toggler);
			}, this);

			return this.toggler;
		},

		attachEvents: function(){
			var click = this.toggler.retrieve('roknavmenu:click', function(event){
				this.toggle.call(this, event, this.toggler);
			}.bind(this));

			this.toggler.addEvent('click', click);

			this.slide = this.toggler.retrieve('roknavmenu:slide', new Fx.Slide(
				document.getElement('.gf-menu-device-container'), {
					duration: 350,
					hideOverflow: true,
					resetHeight: true,
					link: 'cancel',
					onStart: function(){
						if (!this.open) this.wrapper.addClass('gf-menu-device-wrapper');
					},
					onComplete: function(){
						if (this.open) this.wrapper.removeClass('gf-menu-device-wrapper');
					}
				}
			).hide());


			try {
				RokMediaQueries.on('(max-width: 882px)', this.mediaQuery.bind(this));
				RokMediaQueries.on('(min-width: 883px)', this.mediaQuery.bind(this));
			}
			catch(error) { if (typeof console != 'undefined') console.error('Error [Responsive Menu] while trying to add a RokMediaQuery "match" event', error); }
		},

		toggle: function(event, toggler){
			var slide = toggler.retrieve('roknavmenu:slide');

			toggler[slide.open ? 'removeClass' : 'addClass']('active');
			slide[slide.open ? 'slideOut' : 'slideIn']();
		},

		mediaQuery: function(query){
			var menu = document.getElement('.gf-menu'),
				container = document.getElement('.gf-menu-device-container'),
				slide = this.toggler.retrieve('roknavmenu:slide');

			if (!menu && !container) return;

			if (query == '(min-width: 883px)'){
				menu.inject(document.getElement('.menu-block'));
				this.slide.wrapper.setStyle('display', 'none');
				this.toggler.setStyle('display', 'none');
			} else {
				menu.inject(container);
				this.slide.wrapper.setStyle('display', 'inherit');
				this.toggler.setStyle('display', 'block');
			}

			slide.hide();
			this.toggler.removeClass('active');
		}
	});

	window.addEvent('domready', function(){
		this.RokNavMenu = new ResponsiveMenu();
	});

})());
