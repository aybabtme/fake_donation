/**
 * RokBox System Plugin
 *
 * @package     Joomla
 * @subpackage  RokBox System Plugin
 * @copyright Copyright (C) 2009 RocketTheme. All rights reserved.
 * @license http://www.gnu.org/copyleft/gpl.html GNU/GPL, see RT-LICENSE.php
 * @author RocketTheme, LLC
 *
 * RokBox System Plugin includes:
 * ------------
 * SWFObject v1.5: SWFObject is (c) 2007 Geoff Stearns and is released under the MIT License:
 * http://www.opensource.org/licenses/mit-license.php
 * -------------
 * JW Player: JW Player is (c) released under CC by-nc-sa 2.0:
 * http://creativecommons.org/licenses/by-nc-sa/2.0/
 *
 */

Element.implement({
    'rbshow': function() {
        return this.setStyle('display', '');

    },
    'rbhide': function() {
        return this.setStyle('display', 'none');
    }

});

String.implement({
    'sameDomain': function()  {
        var domain = /^(http|https):\/\/([a-z-.0-9]+)[\/]{0,1}/i.exec(window.location);
        var lnk = /^(http|https):\/\/([a-z-.0-9]+)[\/]{0,1}/i.exec(this);
        return domain[2] === lnk[2];
    }
});

var RokBox = new Class({
    version: '2.3',
    Implements: [Options, Events],
    options: {
        'className': 'rokbox',
        'theme': 'default',
        'transition': Fx.Transitions.Quad.easeOut,
        'duration': 200,
        'chase': 40,
        'effect': 'quicksilver',
        'captions': true,
        'captionsDelay': 800,
        'scrolling': false,
        'keyEvents': true,
        overlay: {
            'background': '#000',
            'opacity': 0.85,
            'zIndex': 65550,
            'duration': 200,
            'transition': Fx.Transitions.Quad.easeInOut

        },
        'frame-border': 0,
        'content-padding': 0,
        'arrows-height': 50,
        defaultSize: {
            'width': 640,
            'height': 460

        },
        'autoplay': 'true',
        'controller': 'false',
        'bgcolor': '#f3f3f3',
        'youtubeAutoplay': false,
        'vimeoColor': '00adef',
        'vimeoPortrait': false,
        'vimeoTitle': false,
        'vimeoFullScreen': true,
        'vimeoByline': false

    },
    initialize: function(options)
    {
        this.setOptions(options);
        var regexp = new RegExp("^" + this.options.className),
        cls = this.options.className,
        self = this;
        this.current = [];
        this.groups = new Hash({});
        this.changeGroup = false;
        this.swtch = false;
        this.elements = $$('a').filter(this.isRokBoxElement.bind(this));
        var overlayOptions = Object.merge(this.options.overlay, {
            'id': cls + '-overlay',
            'class': cls + '-overlay'

        });
        this.overlayObj = new Rokverlay(false, overlayOptions).addEvent('onShow', function() {
            self.open(self.current);
        }).addEvent('onHide', function() {
            if (self.changeGroup) {
                self.changeGroup = false;
                var e = self.nextGroup[0],
                selfLink = self.nextGroup[1],
                list = self.nextGroup[2],
                index = self.nextGroup[3],
                what;
                if (selfLink.get('id').test('next')) what = list[index];
                else what = list[index - 2];
                self.click.delay(100, self, [what.title, what.href, what.rel, self, what]);
            }
        });
        this.overlay = document.id(this.overlayObj.overlay).addEvent('click', function() {
            self.swtch = false;
            self.close();
        });

        this.wrapper = new Element('div', {
            'id': cls + '-wrapper',
            'class': cls + '-' + this.options.theme

        }).inject(document.body).setStyles({
            'position': 'absolute',
            'zIndex': 65555,
            'opacity': 0
        }).rbhide();

        var topleft = new Element('div', {
            'id': cls + '-top',
            'class': cls + '-left'

        }).inject(this.wrapper);
        var topright = new Element('div', {
            'class': cls + '-right'

        }).inject(topleft);
        var topcenter = new Element('div', {
            'class': cls + '-center'

        }).inject(topright);
        var middleleft = new Element('div', {
            'id': cls + '-middle',
            'class': cls + '-left'

        }).inject(this.wrapper);
        var middleright = new Element('div', {
            'class': cls + '-right'

        }).inject(middleleft);
        this.center = new Element('div', {
            'class': cls + '-center'

        }).inject(middleright);
        var bottomleft = new Element('div', {
            'id': cls + '-bottom',
            'class': cls + '-left'

        }).inject(this.wrapper);
        var bottomright = new Element('div', {
            'class': cls + '-right'

        }).inject(bottomleft);
        var bottomcenter = new Element('div', {
            'class': cls + '-center'

        }).inject(bottomright);
        new Element('div', {
            'class': 'clr'

        }).inject(this.wrapper);
        this.closeButton = new Element('a', {
            'id': cls + '-close',
            'href': '#'

        }).set('html', '<span>[x] close</span>').inject(this.center);
        this.closeButton.addEvent('click',
        function(e)
        {
            if (e) e.stop();
            self.swtch = false;
            self.close(e);

        });
        this.fx = {
            'wrapper': new Fx.Morph(this.wrapper, {
                'duration': this.options.duration,
                link: 'ignore',
                'transition': this.options.transition,
                onComplete: function() {
                    if (self.type == 'image') return;
                    if (!this.element.getStyle('opacity').toInt() && self.overlayObj.open) {
                        self.wrapper.rbhide();
                        if (!self.swtch) {
                            self.overlayObj.hide();
                        } else {
                            if (self.changeGroup) {
                                self.changeGroup = false;
                                var e = self.nextGroup[0],
                                selfLink = self.nextGroup[1],
                                list = self.nextGroup[2],
                                index = self.nextGroup[3],
                                what;
                                if (selfLink.get('id').test('next')) what = list[index];
                                else what = list[index - 2];
                                self.click.delay(100, self, [what.title, what.href, what.rel, self, what]);
                            }
                        }
                    } else {
                        self.loadVideo.delay(50, self);
                    }
                }
            }),
            'center': new Fx.Morph(this.center, {'duration': this.options.duration, wait: true, 'transition': this.options.transition }),
            'height': new Fx.Tween(this.center, {'duration': this.options.duration, wait: true, 'transition': this.options.transition})
        };
        window.addEvent('resize', function() {
            self.reposition(self.wrapper);
            self.overlayObj.reposition();
        });

        if (this.options.scrolling) window.addEvent('scroll', function() {
            self.reposition(self.wrapper);
        });
    },
    isRokBoxElement: function(lnk){
        var rel = lnk.get('rel'),
            group = false,
            len = false,
            module = false;

        if (lnk.isRokBox) return false;

        var test = (rel || '').test(new RegExp("^" + this.options.className));
        if (test)
        {
            lnk.isRokBox = true;
            if (rel) group = rel.match(/\([a-z0-9A-Z]+\)/g) || false;
            if (rel) module = rel.match(/\[module\=(.+)+\]/) || false;
            if (module[1]) {
                lnk.module = module[1];
            } else {
                lnk.module = false;
            };

            if (group[0]) {
                group = group[0].replace("(", "").replace(")", "");
                if (!this.groups.has(group)) this.groups.set(group, []);
                var groups = this.groups.get(group);
                groups.push(lnk);
                len = groups.length;
                this.groups.set(group, groups);
            };

            lnk.group = group;
            lnk.idx = len;

            var tmp = this.click.pass([lnk.title, lnk.href, lnk.rel, this], lnk);
            lnk.addEvent('click', function(e){
                e.preventDefault();
                tmp();
            }.bind(this));
        };
        return test;
    },

    refresh: function(){
        this.elements = $$('a').filter(this.isRokBoxElement.bind(this));
    },

    click: function(title, href, options, self, me) {
        var fs = '';
        var match = options.match(/([0-9]+\s?[0-9]+)/g) || [''];
        match = match[0].split(" ");
        var match = options.match(/([0-9%]+\s?[0-9%]+)/g) || [''];
        fs = match[0].split(" ");
        match = match[0].split(" ");
        if (options.match(/fullscreen/g)) fs = 'fullscreen';
        var tmp = self.overflow();
        if (!me) me = false;
        var group = this.group || me.group;
        var closeHeight = self.closeButton.getStyle('height').toInt() || self.closeButton.getSize().y || 0;
        var arrowHeight = self.options['arrows-height'] || 0;
        match[0] = (match[0]) ? match[0] : '';
        match[1] = (match[1]) ? match[1] : '';
        if ((!match[0].contains("%") && !match[1].contains("%")) && !match[0].length || !match[1].length) {
            if (href.match(/youtube\.com\/watch/i)) {
                match[0] = 640;
                match[1] = 385;
            } else if (href.match(/dailymotion\./i)) {
                match[0] = 420;
                match[1] = 339;
            } else if (href.match(/metacafe\.com\/watch/i)) {
                match[0] = 400;
                match[1] = 345;
            } else if (href.match(/google\.com\/videoplay/i)) {
                match[0] = 400;
                match[1] = 326;
            } else if (href.match(/vimeo\.com\/[0-9]{1,}/i)) {
                match[0] = 400;
                match[1] = 225;
            } else if (href.match(/\.(mov|qt|mpeg|divx|avi|xvid|mv4|m4v|wmv|wma|wax|wvx|asx|asf)$/i)) {
                match[0] = 504;
                match[1] = 336;
            } else if (href.match(/\.(mp3|wav|m4a)$/i)) {
                match[0] = 320;
                match[1] = 45;
            }
        };
        var winSize = window.getSize();
        if (match[0] > ((Browser.Engine.presto) ? window.innerWidth: winSize.x) || fs == 'fullscreen') match[0] = ((Browser.Engine.presto) ? window.innerWidth: winSize.x) - self.overflow(true) - 20;
        if (match[1] > ((Browser.Engine.presto) ? window.innerHeight: winSize.y) || fs == 'fullscreen') match[1] = ((Browser.Engine.presto) ? window.innerHeight: winSize.y) - self.overflow() - closeHeight - arrowHeight - 20;
        if (typeOf(match[0]) != 'number' && typeOf(match[1]) != 'number') {
            if (match[0].contains("%") && match[1].contains("%")) {
                var ww = (Browser.Engine.presto) ? window.innerWidth: winSize.x;
                var wh = (Browser.Engine.presto) ? window.innerHeight: winSize.y;
                match[0] = match[0].replace("%", "").toInt();
                match[1] = match[1].replace("%", "").toInt();
                match[0] = match[0] > 100 ? 100: match[0];
                match[1] = match[1] > 100 ? 100: match[1];
                match[0] = ww * match[0] / 100;
                match[1] = wh * match[1] / 100;
                match[0] = match[0] - self.overflow(true) - 20;
                match[1] = match[1] - self.overflow() - closeHeight - arrowHeight - 20;
            }
        }
        options = {
            width: (match[0] || self.options.defaultSize.width).toInt(),
            height: (match[1] || self.options.defaultSize.height).toInt()
        };
        options2 = {
            width: (match[0] || self.options.defaultSize.width).toInt() + self.overflow(true),
            height: (match[1] || self.options.defaultSize.height).toInt() + self.overflow() + closeHeight
        };
        self.current = [this, title, href, options, group, this.idx || me.idx, options2, this.module];
        if (!self.swtch) self.overlayObj.toggle();
        else self.open(self.current);

    },
    overflow: function(margin) {
        var tmp = (this.options['frame-border'] * 2) + (this.options['content-padding'] * 2);
        return tmp;
    },

    open: function() {
        arguments = arguments[0];
        var b = arguments;
        var el = arguments[0],
        title = arguments[1],
        href = arguments[2],
        size = arguments[3],
        options = arguments[6],
        module = arguments[7],
        self = this;
        this.closeButton.setStyle('visibility', 'visible');
        var closeHeight = self.closeButton.getStyle('height').toInt() || self.closeButton.getSize().y || self.closeButton.currentStyle.height.toInt() || 0;
        if (self.closeButton.getStyle('position') == 'absolute') closeHeight = 0;
        var arrowHeight = self.options['arrows-height'] || 0;

        this.wrapper.setStyles({
            'width': options.width,
            'height': options.height + arrowHeight + closeHeight

        }).rbshow();
        this.center.setStyles({
            'width': size.width,
            'height': size.height + closeHeight + arrowHeight

        });
        if (self.options.captions && !this.caption)
        {
            var getCaption = self.getCaption(title) || [false, false];
            var title = getCaption[0],
            description = getCaption[1];
            this.caption = new Element('div', {
                'id': this.options.className + '-caption'

            }).inject(this.center).setStyle('opacity', 0).adopt(title, description);

        };
        if (self.options.captions && this.caption) this.caption.rbhide().setStyle('height', 0);
        if (self.container) self.container.empty();
        var position = this.reposition(this.wrapper, options)[1];
        this.fx.wrapper.start(this.effects(this.options.effect, position).start).chain(function()
        {
            if (self.options.captions && self.caption)
            {
                (function() {
                    var height = self.caption.getSize().y || 0;
                    var center = self.center.getStyle('height').toInt();

                    var captionText = self.caption.get('text').trim().length;
                    self.fx.height.start('height', center + height - closeHeight).chain(function() {
                        self.caption.fade('in');
                        if (self.options.keyEvents) {
                            self.evt = self.keyEvents.bind(self);
                            document.addEvent('keyup', self.evt);
                        }
                    });

                }).delay(self.options.captionsDelay);
            }
        });
        var h = size.height + closeHeight + arrowHeight;
        var f = this.effects(this.options.effect, position).start;
        if (f.width || f.height) this.fx.center.start({
            'width': (typeOf(f.width) == 'array') ? [0, size.width] : size.width,
            'height': (typeOf(f.height) == 'array') ? [0, h] : h

        });
        else this.center.setStyles({
            'width': size.width,
            'height': h

        });
    },
    close: function(event, animation) {
        var self = this,
        effect;
        var position = {
            'left': this.wrapper.getStyle('left').toInt(),
            'top': this.wrapper.getStyle('top').toInt()
        };
        this.closeButton.setStyle('visibility', 'hidden');
        this.container.removeClass('spinner');
        this.unloadVideo();
        effect = this.effects((animation) ? animation: this.options.effect, position).end;
        if (this.options.captions) this.caption.fade('out');
        if (this.options.keyEvents) document.removeEvent('keyup', self.evt);
        if (this.arrows) this.arrows.dispose();
        this.arrows = false;
        var tmp = {};
        if (effect.width != null) tmp.width = Math.abs(effect.width - self.overflow());
        if (effect.height != null) tmp.height = Math.abs(effect.height);
        this.fx.center.start(tmp).chain(function() {
            self.fx.height.cancel();
            if (self.caption) self.caption.setStyle('height', '');
            self.center.setStyles({
                'width': '',
                'height': ''

            });
            self.container.setStyles({
                'width': '',
                'height': ''

            });
        });
        this.fx.wrapper.start(effect);
        return this;
    },

    keyEvents: function(e) {
        switch (e.key) {
            case 'left':
                if (this.arrows) this.prevArrow.fireEvent('click', e);
                break;
            case 'right':
                if (this.arrows) this.nextArrow.fireEvent('click', e);
                break;
            case 'esc':
                this.swtch = false;
                this.close(e, 'growl');
        }
    },

    reposition: function(wrapper, size) {
        var winSize = window.getSize(), winScroll = window.getScroll();
        if (!wrapper) wrapper = document.id(this.wrapper);
        if (!size) {
            var tmp = wrapper.getSize();
            size = {
                'width': tmp.x,
                'height': tmp.y
            };
        };
        var plus = this.options['arrows-height'];

        var left = winScroll.x + (((Browser.Engine.presto) ? window.innerWidth: winSize.x) / 2) - (size.width / 2) - wrapper.getStyle('padding-left').toInt();
        var top = winScroll.y + (((Browser.Engine.presto) ? window.innerHeight: winSize.y) / 2) - (size.height / 2) - wrapper.getStyle('padding-top').toInt() - (plus / 2);

        var position = {
            'top': (top > 0) ? top : 0,
            'left': (left > 0) ? left : 0

        };
        return [wrapper.setStyles(position), position];

    },
    loadVideo: function()
    {
        if (this.container) this.container.dispose();
        if (this.caption) this.caption.rbhide();
        var caption = this.current[1],
        url = this.current[2],
        size = this.current[3],
        group = this.current[4],
        index = this.current[5],
        cls = this.options.className;
        var module = this.current[7];
        var closeHeight = this.closeButton.getStyle('height').toInt() || this.closeButton.getSize().size.y || 0;
        var arrowHeight = this.options['arrows-height'] || 0;
        this.type = false;
        if (module)  {
            this.type = 'module';
            this.object = document.id(module);
        } else if (url.match(/\.(gif|jpg|jpeg|png|bmp)$/i) || this.current[0].alt == 'image') {
            this.type = 'image';
            var self = this;
            this.object = new Asset.image(url, {
                id: 'rokboxobject',
                onerror: function() {
                    self.container.removeClass('spinner').addClass('warning');
                    self.container.set('html', '<h1>Image not found.</h1>');
                },
                onload: function() {
                    size.width = this.width;
                    size.height = this.height;
                    //if (self.arrows) self.arrows.rbhide();
                    self.container.setStyles(size);
                    var img = this, winSize = window.getSize(), winScroll = window.getScroll();
                    var top = winScroll.y + (winSize.y / 2) - (this.height / 2) - self.wrapper.getStyle('padding-top').toInt();
                    if (top < 0) top = 0;

                    if (self.center.getStyle('width').toInt() != size.width && self.center.getStyle('height').toInt() != size.height) {
                        self.fx.center.start({
                            'width': size.width,
                            'height': size.height + self.overflow(true) + arrowHeight
                        });
                    };

                    var left =  winScroll.x + (winSize.x / 2) - (this.width / 2) - (self.overflow(true) / 2) - self.wrapper.getStyle('padding-left').toInt();
                    self.fx.wrapper.start({
                        'left': (left > 0) ? left : 0,
                        'width': this.width + self.overflow(true),
                        'height': this.height + self.overflow() + arrowHeight + closeHeight
                    }).chain(function() {
                        self.container.removeClass('spinner');
                        img.inject(self.container);
                        if (self.arrows) self.arrows.rbshow();
                    });
                }
            });

        } else if (url.match(/\.(mov|qt|mpeg|divx|avi|xvid|mv4|m4v)$/i)) {
            this.type = 'qt';
            if (navigator.plugins && navigator.plugins.length) {
                this.object = '<object id="rokboxobject" standby="loading..." type="video/quicktime" codebase="http://www.apple.com/qtactivex/qtplugin.cab" data="' + url + '" width="' + size.width + '" height="' + size.height + '"><param name="src" value="' + url + '" /><param name="scale" value="aspect" /><param name="controller" value="' + this.options.controller + '" /><param name="autoplay" value="' + this.options.autoplay + '" /><param name="bgcolor" value="' + this.options.bgcolor + '" /><param name="enablejavascript" value="true" /></object>';
            } else {
                this.object = '<object classid="clsid:02BF25D5-8C17-4B23-BC80-D3488ABDDC6B" standby="loading..." codebase="http://www.apple.com/qtactivex/qtplugin.cab" type="video/quicktime" width="' + size.width + '" height="' + size.height + '" id="rokboxobject"><param name="src" value="' + url + '" /><param name="scale" value="aspect" /><param name="controller" value="' + this.options.controller + '" /><param name="autoplay" value="' + this.options.autoplay + '" /><param name="bgcolor" value="' + this.options.bgcolor + '" /><param name="enablejavascript" value="true" /></object>';
            }
        } else if (url.match(/\.(wmv|wma|wax|wvx|asx|asf)$/i)) {
            this.type = 'wmv';
            if (navigator.plugins && navigator.plugins.length) {
                this.object = '<object id="rokboxobject" standby="loading..." type="application/x-oleobject" data="' + url + '" width="' + size.width + '" height="' + size.height + '" /><param name="src" value="' + url + '" /><param name="autoStart" value="' + this.options.autoplay + '" /><param name="bgcolor" value="' + this.options.bgcolor + '" /></object>';
            } else {
                this.object = '<object id="rokboxobject" standby="loading..." classid="CLSID:22D6f312-B0F6-11D0-94AB-0080C74C7E95" type="application/x-oleobject" data="' + url + '" width="' + size.width + '" height="' + size.height + '" /><param name="filename" value="' + url + '" /><param name="showcontrols" value="' + this.options.controller + '"><param name="autoStart" value="' + this.options.autoplay + '" /><param name="bgcolor" value="' + this.options.bgcolor + '" /><param name="stretchToFit" value="true" /></object>';
            }
        } else if (url.match(/youtube\.com\/watch\?v=/i) || url.match(/youtube\-nocookie\.com\/watch\?v=/i)) {
            this.type = 'flash';
            var ytOptions = parseUri(url);
            this.videoID = ytOptions['queryKey']['v'];
            delete ytOptions['queryKey']['v'];

            if (this.options.youtubeAutoplay && !ytOptions['queryKey']['autoplay']) ytOptions['queryKey']['autoplay'] = 1;
            this.object = new SWFObject("http://www.youtube.com/v/" + this.videoID + '&' + Hash.toQueryString(ytOptions['queryKey']), "rokboxobject", size.width, size.height, "9", this.options.bgcolor, "wmode", "transparent");
            this.object.addParam('allowscriptaccess', 'always');
            this.object.addParam('allowfullscreen', 'true');
        } else if (url.match(/dailymotion\./i)) {
            this.type = 'flash';
            var videoId = url.split("_")[0].split('/');
            this.videoId = videoId[videoId.length - 1];
            this.object = new SWFObject("http://www.dailymotion.com/swf/" + this.videoId + "&v3=1&colors=background:DDDDDD;glow:FFFFFF;foreground:333333;special:FFC300;&autoPlay=1&related=0", "rokboxobject", size.width, size.height, "9", this.options.bgcolor);
            this.object.addParam('allowscriptaccess', 'always');
            this.object.addParam('allowfullscreen', 'true');

        } else if (url.match(/metacafe\.com\/watch/i)) {
            this.type = 'flash';
            var videoId = url.split('/');
            this.videoID = videoId[4];
            this.object = new SWFObject("http://www.metacafe.com/fplayer/" + this.videoID + "/.swf", "rokboxobject", size.width, size.height, "9", this.options.bgcolor, "wmode", "transparent");
            this.object.addParam('allowscriptaccess', 'always');
            this.object.addParam('allowfullscreen', 'true');
        } else if (url.match(/google\.com\/videoplay/i)) {
            this.type = 'flash';
            var videoId = url.split('=');
            this.videoID = videoId[1];
            this.object = new SWFObject("http://video.google.com/googleplayer.swf?docId=" + this.videoID + "&autoplay=1&hl=en", "rokboxobject", size.width, size.height, "9", this.options.bgcolor, "wmode", "transparent");
            this.object.addParam('allowscriptaccess', 'always');
            this.object.addParam('allowfullscreen', 'true');
        } else if (url.match(/vimeo\.com\/[0-9]{1,}/i)) {
            this.type = 'flash';
            var videoId = url.split('/');
            this.videoID = videoId[3];
            this.options.vimeoFullScreen = (this.options.vimeoFullScreen) ? 1: 0;
            this.options.vimeoTitle = (this.options.vimeoTitle) ? 1: 0;
            this.options.vimeoByline = (this.options.vimeoByline) ? 1: 0;
            this.options.vimeoPortrait = (this.options.vimeoPortrait) ? 1: 0;
            this.options.vimeoColor = (this.options.vimeoColor.match(/[0-9]{6}/)) ? this.options.vimeoColor: '00adef';
            this.object = new SWFObject("http://www.vimeo.com/moogaloop.swf?clip_id=" + this.videoID + "&amp;server=www.vimeo.com&amp;fullscreen=" + this.options.vimeoFullScreen + "&amp;show_title=" + this.options.vimeoTitle + "&amp;show_byline=" + this.options.vimeoByline + "&amp;show_portrait=" + this.options.vimeoPortrait + "&amp;color=" + this.options.vimeoColor + "", "rokboxobject", size.width, size.height, "9", this.options.bgcolor);
            this.object.addParam('allowscriptaccess', 'always');
            this.object.addParam('allowfullscreen', 'true');
        } else if (url.match(/\.swf/i)) {
            this.type = 'flash';
            this.object = new SWFObject(url, "rokboxobject", size.width, size.height, "9", this.options.bgcolor, "wmode", "transparent");
            this.object.addParam('allowscriptaccess', 'always');
            this.object.addParam('allowfullscreen', 'true');
        } else if (url.match(/\.flv/i) && window.rokboxPath) {
            this.type = 'flash';
            url = window.rokboxPath + 'jwplayer/jwplayer.swf?file=' + url;
            this.object = new SWFObject(url, "rokboxobject", size.width, size.height, "9", this.options.bgcolor, "wmode", "transparent");
            this.object.addParam('allowscriptaccess', 'always');
            this.object.addParam('allowfullscreen', 'true');
        } else if (url.match(/\.(mp3|m4a)$/i)) {
            this.type = 'audio';
            this.object = '<object id="rokboxobject"" width="' + size.width + '" height="' + size.height + '" data="' + url + '"" type="' + ((Browser.Engine.trident) ? 'application/x-mplayer2': 'audio/mpeg') + '"><param value="' + url + '" name="src"/><param value="' + url + '" name="filename"/><param value="' + ((Browser.Engine.trident) ? 'application/x-mplayer2': 'audio/mpeg') + '" name="type"/><param name="bgcolor" value="' + this.options.bgcolor + '" /><p>No plugin matched for playing: ' + url + '</p></object>';
        } else if (url.match(/\.wav$/i)) {
            this.type = 'audio';
            this.object = '<object id="rokboxobject"" width="' + size.width + '" height="' + size.height + '" data="' + url + '"" type="' + ((Browser.Engine.trident) ? 'application/x-mplayer2': 'audio/wav') + '"><param value="' + url + '" name="src"/><param value="' + url + '" name="filename"/><param value="' + ((Browser.Engine.trident) ? 'application/x-mplayer2': 'audio/wav') + '" name="type"/><param name="bgcolor" value="' + this.options.bgcolor + '" /><p>No plugin matched for playing: ' + url + '</p></object>';
        } else {
            this.type = 'iframe';
            var IFrameID = "rokboxobject" + Date.now() + Number.random(0, 100);
            this.object = new Element('iframe').setProperties({
                id: IFrameID,
                width: size.width,
                height: size.height,
                frameBorder: 0,
                scrolling: 'auto',
                src: url
            });
            var self = this;
            this.object.onload = function() {self.container.removeClass('spinner');};
        }
        this.movie = document.id('rokboxobject');
        if (this.type) {
            this.container = new Element('div', {
                'id': cls + '-container',
                'class': cls + '-container'
            }).addClass('spinner').setStyles(size).inject(this.center);
            if (this.type == 'flash') this.object.write(this.container);
            else if (this.type == 'module') {
                var clone = this.object.clone(true, true);
                clone.inject(this.container.removeClass('spinner')).setStyle('display', 'block');
                if (this.object.get('id')) clone.set('id', this.object.get('id'));
            } else if (this.type == 'html') {
                this.object.inject(this.container);
                new Ajax(url, {
                    'method': 'get',
                    'evalScripts': true,
                    'update': this.object,
                    onComplete: function() {
                        this.container.removeClass('spinner');
                    }.bind(this)
                }).request();
            } else if (this.type == 'iframe') {
                this.object.inject(this.container);
            } else if (this.type != 'image') this.container.removeClass('spinner').set('html', this.object);

            if (group) {
                var list = this.groups.get(group),
                self = this;
                if (list.length > 1) {
                    if (!this.arrows) {
                        this.arrows = new Element('div', {
                            'id': this.options.className + '-arrows'
                        }).inject(this.center).rbhide();

                        if (index != 1) {
                            this.prevArrow = new Element('a', {
                                'id': this.options.className + '-previous'
                            }).inject(this.arrows).set('html', '<span>&lt;previous</span>');
                            this.prevArrow.setProperties({
                                'href': list[index - 2].get('href'),
                                'title': list[index - 2].get('title')
                            });
                        };

                        if (index != list.length) {
                            this.nextArrow = new Element('a', {
                                'id': this.options.className + '-next'
                            }).inject(this.arrows).set('html', '<span>next &gt;</span>');
                            this.nextArrow.setProperties({
                                'href': list[index].get('href'),
                                'title': list[index].get('title')
                            });
                        };

                        if (index == 1) this.prevArrow = new Element('a', {
                            'id': this.options.className + '-previous',
                            'class': 'inactive',
                            'href': '#'
                        }).inject(this.arrows, 'top').set('html', '<span>&lt;previous</span>');

                        if (index == list.length) this.nextArrow = new Element('a', {
                            'id': this.options.className + '-next',
                            'class': 'inactive',
                            'href': '#'
                        }).inject(this.arrows).set('html', '<span>next &gt;</span>');

                        this.prevArrow.addEvent('click', function(e) {
                            if (e) e.stop();
                            if (!this.hasClass('inactive')) {
                                self.changeGroup = true;
                                self.nextGroup = [e, this, list, index];
                                self.swtch = true;
                                self.close(e, 'growl');
                            }
                        });

                        this.nextArrow.addEvent('click', function(e) {
                            if (e) e.stop();
                            if (!this.hasClass('inactive')) {
                                self.changeGroup = true;
                                self.nextGroup = [e, this, list, index];
                                self.swtch = true;
                                self.close(e, 'growl');
                            }
                        });
                    };

                    this.arrows.rbshow();
                }
            };

            if (this.options.captions) {
                var getCaption = this.getCaption(caption) || [false, false];
                var title = getCaption[0],
                description = getCaption[1];
                if (this.caption) this.caption.empty().dispose();
                this.caption = new Element('div', {
                    'id': this.options.className + '-caption'
                }).inject(this.center).setStyle('opacity', 0).adopt(title, description);
            }
        }
    },

    unloadVideo: function() {
        if (this.type) {this.container.setStyle('visibility', 'hidden').empty();}
        this.movie = null;
        this.type = false;
    },

    getCaption: function(caption) {
        caption = caption.split(" :: ") || false;
        switch (caption.length) {
            case 0:
                return false;
                break;
            case 1:
                var title = false;
                var description = new Element('p').set('text', caption[0]);
                break;
            case 2:
                var title = new Element('h2').set('text', caption[0]);
                var description = new Element('p').set('text', caption[1]);
                break;
        }

        return [title, description];
    },

    getGroup: function(el) {
        var rel = el.get('rel'),
        group = false;
        if (rel) group = rel.match(/\([a-z0-9A-Z]+\)/g) || false;
        if (group[0]) group = group[0].replace("(", "").replace(")", "");
        else group = false;
        return group;
    },

    effects: function(type, position) {
        var effect = {};
        if (!position) position = 0;
        switch (type) {
            case 'growl':
                effect = {
                    'start': {
                        'top': [position.top - this.options.chase, position.top],
                        'opacity': 1
                    },
                    'end': {
                        'top': this.wrapper.getStyle('top').toInt() + this.options.chase,
                        'opacity': 0
                    }
                };
                break;
            case 'quicksilver':
                var height = this.wrapper.getStyle('height').toInt(),
                width = this.wrapper.getStyle('width').toInt();
                effect = {
                    'start': {
                        'top': [position.top + (height / 2), position.top],
                        'height': [0, height],
                        'opacity': 1
                    },
                    'end': {
                        'top': position.top + (height / 2),
                        'left': window.getSize().x / 2 - ((window.getScrollSize().x - 10) / 2),
                        'width': window.getScrollSize().x - 30,
                        'height': 0,
                        'opacity': 0
                    }
                };
                break;
            case 'explode':
                var height = this.wrapper.getStyle('height').toInt(),
                width = this.wrapper.getStyle('width').toInt();
                effect = {
                    'start': {
                        'height': [0, height],
                        'width': [0, width],
                        'opacity': 1,
                        'top': [(window.getSize().y / 2) + window.getScroll().y, position.top],
                        'left': [(window.getSize().x / 2) + window.getScroll().x, position.left]
                    },
                    'end': {
                        'height': 0,
                        'width': 0,
                        'opacity': 0,
                        'top': (window.getSize().y / 2) + window.getScroll().y,
                        'left': (window.getSize().x / 2) + window.getScroll().x
                    }
                };
                break;
            case 'fade':
                effect = {
                    'start': {'opacity': 1},
                    'end': {'opacity': 0}
                };
        };
        return effect;
    }
});

var Rokverlay = new Class({
    Implements: [Options, Events],
    options: {
        'id': false,
        'class': false,
        'background': '#000000',
        'opacity': 0.7,
        'zIndex': 65555,
        'duration': 200,
        'transition': Fx.Transitions.Quad.easeInOut
    },

    initialize: function(where, options) {
        this.where = document.id(where) || document.body;
        this.setOptions(options);
        this.overlay = new Element('div', {
            'id': this.options.id || ('rokverlay-' + $random(1, 1000)),
            'class': this.options.id || ('rokverlay-' + $random(1, 1000)),
            'styles': {
                'opacity': 0,
                'display': 'none',
                'position': 'absolute',
                'top': 0,
                'left': 0,
                'cursor': 'pointer',
                'background-color': this.options.background,
                'z-index': this.options.zIndex
            }
        }).inject(document.id(document.body));

        this.fx = new Fx.Tween(this.overlay, {
            duration: this.options.duration,
            transition: this.options.transition
        });

        this.open = false;
        return this;
    },

    reposition: function(sizes) {
        var where = this.where;
        sizes = sizes || window.getScrollSize();
        document.id(this.overlay).setStyles({
            top: where.getPosition().y || 0,
            left: where.getPosition().x || 0,
            width: (Browser.Engine.webkit) ? '100%' : window.getSize().x,
            height: sizes.y
        });

        return this;
    },

    show: function() {
        var overlay = this.overlay,
        self = this;
        this.overlay.setStyle('display', '');
        this.open = true;
        this.reposition().fx.start('opacity', this.options.opacity).chain(function() {
            self.fireEvent('onShow', overlay);
        });

        return this;
    },

    hide: function() {
        var overlay = this.overlay,
        self = this;
        this.open = false;
        this.reposition().fx.start('opacity', 0).chain(function() {
            overlay.setStyle('display', 'none');
            self.fireEvent('onHide', overlay);
        });

        return this;
    },

    toggle: function() {
        this[this.open ? 'hide': 'show']();
        return this;
    }
});



/*
    parseUri 1.2.1
    (c) 2007 Steven Levithan <stevenlevithan.com>
    MIT License
*/

function parseUri (str) {
    var o   = parseUri.options,
        m   = o.parser[o.strictMode ? "strict" : "loose"].exec(str),
        uri = {},
        i   = 14;

    while (i--) uri[o.key[i]] = m[i] || "";

    uri[o.q.name] = {};
    uri[o.key[12]].replace(o.q.parser, function ($0, $1, $2) {
        if ($1) uri[o.q.name][$1] = $2;
    });

    return uri;
};

parseUri.options = {
    strictMode: false,
    key: ["source","protocol","authority","userInfo","user","password","host","port","relative","path","directory","file","query","anchor"],
    q:   {
        name:   "queryKey",
        parser: /(?:^|&)([^&=]*)=?([^&]*)/g
    },
    parser: {
        strict: /^(?:([^:\/?#]+):)?(?:\/\/((?:(([^:@]*):?([^:@]*))?@)?([^:\/?#]*)(?::(\d*))?))?((((?:[^?#\/]*\/)*)([^?#]*))(?:\?([^#]*))?(?:#(.*))?)/,
        loose:  /^(?:(?![^:@]+:[^:@\/]*@)([^:\/?#.]+):)?(?:\/\/)?((?:(([^:@]*):?([^:@]*))?@)?([^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/
    }
};





/**
 * SWFObject v1.5: Flash Player detection and embed - http://blog.deconcept.com/swfobject/
 *
 * SWFObject is (c) 2007 Geoff Stearns and is released under the MIT License:
 * http://www.opensource.org/licenses/mit-license.php
 *
 */
if(typeof deconcept=="undefined"){var deconcept=new Object();}if(typeof deconcept.util=="undefined"){deconcept.util=new Object();}if(typeof deconcept.SWFObjectUtil=="undefined"){deconcept.SWFObjectUtil=new Object();}deconcept.SWFObject=function(_1,id,w,h,_5,c,_7,_8,_9,_a){if(!document.getElementById){return;}this.DETECT_KEY=_a?_a:"detectflash";this.skipDetect=deconcept.util.getRequestParameter(this.DETECT_KEY);this.params=new Object();this.variables=new Object();this.attributes=new Array();if(_1){this.setAttribute("swf",_1);}if(id){this.setAttribute("id",id);}if(w){this.setAttribute("width",w);}if(h){this.setAttribute("height",h);}if(_5){this.setAttribute("version",new deconcept.PlayerVersion(_5.toString().split(".")));}this.installedVer=deconcept.SWFObjectUtil.getPlayerVersion();if(!Browser.Engine.presto&&document.all&&this.installedVer.major>7){deconcept.SWFObject.doPrepUnload=true;}if(c){this.addParam("bgcolor",c);}var q=_7?_7:"high";this.addParam("quality",q);this.setAttribute("useExpressInstall",false);this.setAttribute("doExpressInstall",false);var _c=(_8)?_8:window.location;this.setAttribute("xiRedirectUrl",_c);this.setAttribute("redirectUrl","");if(_9){this.setAttribute("redirectUrl",_9);}};deconcept.SWFObject.prototype={useExpressInstall:function(_d){this.xiSWFPath=!_d?"expressinstall.swf":_d;this.setAttribute("useExpressInstall",true);},setAttribute:function(_e,_f){this.attributes[_e]=_f;},getAttribute:function(_10){return this.attributes[_10];},addParam:function(_11,_12){this.params[_11]=_12;},getParams:function(){return this.params;},addVariable:function(_13,_14){this.variables[_13]=_14;},getVariable:function(_15){return this.variables[_15];},getVariables:function(){return this.variables;},getVariablePairs:function(){var _16=new Array();var key;var _18=this.getVariables();for(key in _18){_16[_16.length]=key+"="+_18[key];}return _16;},getSWFHTML:function(){var _19="";if(navigator.plugins&&navigator.mimeTypes&&navigator.mimeTypes.length){if(this.getAttribute("doExpressInstall")){this.addVariable("MMplayerType","PlugIn");this.setAttribute("swf",this.xiSWFPath);}_19="<embed type=\"application/x-shockwave-flash\" src=\""+this.getAttribute("swf")+"\" width=\""+this.getAttribute("width")+"\" height=\""+this.getAttribute("height")+"\" style=\""+this.getAttribute("style")+"\"";_19+=" id=\""+this.getAttribute("id")+"\" name=\""+this.getAttribute("id")+"\" ";var _1a=this.getParams();for(var key in _1a){_19+=[key]+"=\""+_1a[key]+"\" ";}var _1c=this.getVariablePairs().join("&");if(_1c.length>0){_19+="flashvars=\""+_1c+"\"";}_19+="/>";}else{if(this.getAttribute("doExpressInstall")){this.addVariable("MMplayerType","ActiveX");this.setAttribute("swf",this.xiSWFPath);}_19="<object id=\""+this.getAttribute("id")+"\" classid=\"clsid:D27CDB6E-AE6D-11cf-96B8-444553540000\" width=\""+this.getAttribute("width")+"\" height=\""+this.getAttribute("height")+"\" style=\""+this.getAttribute("style")+"\">";_19+="<param name=\"movie\" value=\""+this.getAttribute("swf")+"\" />";var _1d=this.getParams();for(var key in _1d){_19+="<param name=\""+key+"\" value=\""+_1d[key]+"\" />";}var _1f=this.getVariablePairs().join("&");if(_1f.length>0){_19+="<param name=\"flashvars\" value=\""+_1f+"\" />";}_19+="</object>";}return _19;},write:function(_20){if(this.getAttribute("useExpressInstall")){var _21=new deconcept.PlayerVersion([6,0,65]);if(this.installedVer.versionIsValid(_21)&&!this.installedVer.versionIsValid(this.getAttribute("version"))){this.setAttribute("doExpressInstall",true);this.addVariable("MMredirectURL",escape(this.getAttribute("xiRedirectUrl")));document.title=document.title.slice(0,47)+" - Flash Player Installation";this.addVariable("MMdoctitle",document.title);}}if(this.skipDetect||this.getAttribute("doExpressInstall")||this.installedVer.versionIsValid(this.getAttribute("version"))){var n=(typeof _20=="string")?document.getElementById(_20):_20;n.innerHTML=this.getSWFHTML();return true;}else{if(this.getAttribute("redirectUrl")!=""){document.location.replace(this.getAttribute("redirectUrl"));}}return false;}};deconcept.SWFObjectUtil.getPlayerVersion=function(){var _23=new deconcept.PlayerVersion([0,0,0]);if(navigator.plugins&&navigator.mimeTypes.length){var x=navigator.plugins["Shockwave Flash"];if(x&&x.description){_23=new deconcept.PlayerVersion(x.description.replace(/([a-zA-Z]|\s)+/,"").replace(/(\s+r|\s+b[0-9]+)/,".").split("."));}}else{if(navigator.userAgent&&navigator.userAgent.indexOf("Windows CE")>=0){var axo=1;var _26=3;while(axo){try{_26++;axo=new ActiveXObject("ShockwaveFlash.ShockwaveFlash."+_26);_23=new deconcept.PlayerVersion([_26,0,0]);}catch(e){axo=null;}}}else{try{var axo=new ActiveXObject("ShockwaveFlash.ShockwaveFlash.7");}catch(e){try{var axo=new ActiveXObject("ShockwaveFlash.ShockwaveFlash.6");_23=new deconcept.PlayerVersion([6,0,21]);axo.AllowScriptAccess="always";}catch(e){if(_23.major==6){return _23;}}try{axo=new ActiveXObject("ShockwaveFlash.ShockwaveFlash");}catch(e){}}if(axo!=null){_23=new deconcept.PlayerVersion(axo.GetVariable("$version").split(" ")[1].split(","));}}}return _23;};deconcept.PlayerVersion=function(_29){this.major=_29[0]!=null?parseInt(_29[0]):0;this.minor=_29[1]!=null?parseInt(_29[1]):0;this.rev=_29[2]!=null?parseInt(_29[2]):0;};deconcept.PlayerVersion.prototype.versionIsValid=function(fv){if(this.major<fv.major){return false;}if(this.major>fv.major){return true;}if(this.minor<fv.minor){return false;}if(this.minor>fv.minor){return true;}if(this.rev<fv.rev){return false;}return true;};deconcept.util={getRequestParameter:function(_2b){var q=document.location.search||document.location.hash;if(_2b==null){return q;}if(q){var _2d=q.substring(1).split("&");for(var i=0;i<_2d.length;i++){if(_2d[i].substring(0,_2d[i].indexOf("="))==_2b){return _2d[i].substring((_2d[i].indexOf("=")+1));}}}return "";}};deconcept.SWFObjectUtil.cleanupSWFs=function(){var _2f=document.getElementsByTagName("OBJECT");for(var i=_2f.length-1;i>=0;i--){_2f[i].style.display="none";for(var x in _2f[i]){if(typeof _2f[i][x]=="function"){_2f[i][x]=function(){};}}}};if(deconcept.SWFObject.doPrepUnload){if(!deconcept.unloadSet){deconcept.SWFObjectUtil.prepUnload=function(){__flash_unloadHandler=function(){};__flash_savedUnloadHandler=function(){};window.attachEvent("onunload",deconcept.SWFObjectUtil.cleanupSWFs);};window.attachEvent("onbeforeunload",deconcept.SWFObjectUtil.prepUnload);deconcept.unloadSet=true;}}if(!document.getElementById&&document.all){document.getElementById=function(id){return document.all[id];};}var getQueryParamValue=deconcept.util.getRequestParameter;var FlashObject=deconcept.SWFObject;var SWFObject=deconcept.SWFObject;
