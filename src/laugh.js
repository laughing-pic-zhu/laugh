function laugh(params) {
    var nodes = document.querySelector(params.el);
    var obj = params.data||{};
    this.cache = [];

    this.compile = function (dom) {
        this.addQueue(dom);
    };

    this.addQueue = function (nodes) {
        if (nodes.nodeType == 1) {
            this.cache.push(nodes);
            if (nodes.hasChildNodes()) {
                nodes.childNodes.forEach(function (item) {
                    this.addQueue(item);
                }, this)
            }
        }
    };

    this.pasers = function () {
        this.cache = this.cache.map(function (node) {
            return this.paserNode(node);
        }, this);
    };

    this.paserNode = function (node) {
        var text = node.getAttribute('v-text');
        var show = node.getAttribute('v-show');
        //var bind = node.getAttribute('v-bind');
        var model = node.getAttribute('v-model');

        var temp = {
            node: node
        };

        if (text) {
            temp.text = text;
        }
        if (show) {
            temp.show = show;
        }
        //if (bind) {
        //    temp.bind = bind;
        //    node.addEventListener('input', this.onchange.bind(this, bind), false);
        //}
        if (model) {
            if(!obj.hasOwnProperty(model)){
                obj[model]='';
            }
            temp.model = model;
            node.addEventListener('input', this.onchange.bind(this, model), false);
        }
        return temp;
    };

    this.onchange = function (attr) {
        obj[attr] = event.target.value;
    };

    this.textChange = function (node, content) {
        if (typeof content == 'function') {
            content = content.apply(obj);
        }
        node.textContent = content||'';
    };

    this.styleChange = function (node, key, value) {
        node.style[key] = value;
    };

    this.valueChange = function (node, content) {
        node.value = content||'';
    };

    this.judgeNull = function (value) {
        if (value === undefined || value === null || value === '') {
            return false;
        }
        return true;
    };

    this.render = function () {
        var cache = this.cache;
        cache.forEach(function (item) {
            if (this.judgeNull(item.text)) {
                this.textChange(item.node, obj[item.text]);
            }
            if (this.judgeNull(item.show)) {
                var value;
                if (obj[item.show]) {
                    value = 'block';
                } else {
                    value = 'none';
                }
                this.styleChange(item.node, 'display', value);
            }
            if (this.judgeNull(item.model)) {
                this.valueChange(item.node, obj[item.model]);
            }
        }, this);
    };

    this.$watch = function (obj, callback) {
        this.callback = callback;
        this.$observe = function (_obj, path) {
            var type = Object.prototype.toString.call(_obj);
            if (type == '[object Object]' || type == '[object Array]') {
                this.$observeObj(_obj, path);
                if (type == '[object Array]') {
                    this.cloneArray(_obj, path);
                }
            }
        };

        this.$observeObj = function (obj, path) {
            var t = this;
            Object.keys(obj).forEach(function (prop) {
                var val = obj[prop];
                var tpath = path.slice(0);
                tpath.push(prop);
                Object.defineProperty(obj, prop, {
                    get: function () {
                        return val;
                    },
                    set: function (newVal) {
                        var temp = val;
                        val = newVal;
                        t.callback(tpath, newVal, temp);
                    }
                });
                t.$observe(val, tpath);
            });
        };

        this.cloneArray = function (a_array, path) {
            var ORP = ['push', 'pop', 'shift', 'unshift', 'splice', 'sort', 'reverse'];
            var arrayProto = Array.prototype;
            var newProto = Object.create(arrayProto);
            var t = this;
            ORP.forEach(function (prop) {
                Object.defineProperty(newProto, prop, {
                    value: function (newVal) {
                        arrayProto[prop].apply(a_array, arguments);
                        t.callback(path, newVal);
                    },
                    enumerable: false,
                    configurable: true,
                    writable: true
                });
            });
            a_array.__proto__ = newProto;
        };

        this.$observe(obj, []);
    };

    this.observe = function () {
        this.$watch(obj, this.render.bind(this));
    };

    this.init = function () {
        this.compile(nodes);
        this.pasers();
        this.observe();
        this.render();
    };

    this.init();
}





