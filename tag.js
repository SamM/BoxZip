//Returns true if it is a DOM node
function isNode(o) {
    return (
        typeof Node === "object" ? o instanceof Node :
            o && typeof o === "object" && typeof o.nodeType === "number" && typeof o.nodeName === "string"
    );
}

//Returns true if it is a DOM element    
function isElement(o) {
    return (
        typeof HTMLElement === "object" ? o instanceof HTMLElement : //DOM2
            o && typeof o === "object" && o !== null && o.nodeType === 1 && typeof o.nodeName === "string"
    );
}

function tag() {
    let Tag = '';
    let Attrs = {};
    let Styles = {};
    function Element(a, b) {
        if (arguments.length == 1 && typeof a == 'string') {
            Tag = a;
            if (!isElement(Element.DOM) && document) {
                Element.DOM = document.createElement(Tag);
            }
        }
        if (arguments.length == 1 && isElement(a)) {
            Tag = a.tagName;
            Element.DOM = a;
        }
        if (arguments.length == 1 && typeof a == 'object') Element.attr(a);
        if (arguments.length == 2 && typeof a == 'string') Element.attr(a, b);
        if (isElement(Element.DOM)) Tag = Element.DOM.tagName;
        if (arguments.length == 0) return Element.DOM;
        return Element;
    }
    Element.DOM = null;
    Element.attr = function (key, value) {
        if (arguments.length == 0) return Attrs;
        if (arguments.length == 1 && typeof key == 'object') {
            Object.keys(key).forEach(function (k) {
                Element.attr(k, key[k]);
            });
            return Element;
        }
        if (arguments.length == 1 && typeof key == 'string') return Attrs[key];
        if (arguments.length == 2 && typeof key == 'string') {
            if (typeof value == 'object' && isElement(Element.DOM) && key === 'style') {
                Object.assign(Element.DOM.style, value);
                return Element;
            }

            Attrs[key] = value.toString();

            if (isElement(Element.DOM)) {
                //Element.DOM[key] = Attrs[key];
                Element.DOM.setAttribute(key, Attrs[key]);
            }
        }
        return Element;
    }
    Element.style = function (key, value) {
        if(!isElement(Element.DOM)) return Element;
        if (arguments.length == 1 && typeof key == 'string') return Element.DOM.style[key];
        if (arguments.length == 1 && typeof key == 'object'){
            Object.assign(Styles, key);
            Object.assign(Element.DOM.style, Styles);
            return Element;
        }
        if (arguments.length == 2 && typeof key == 'string' && typeof value == 'string' || typeof value == 'number') {
            Styles[key] = Element.DOM.style[key] = value + '';
        }
        return Element;
    };
    Element.css = Element.style;
    Element.html = function (set) {
        if (typeof set == 'string') {
            if (isElement(Element.DOM)) Element.DOM.innerHTML = set;
            return Element;
        }
        function getAttrStr(key) {
            return key + '="' + Attrs[key] + '"'
        }
        let html = '<' + [Tag].concat(Object.keys(Attrs).map(getAttrStr)).join(' ') + '>';
        if (isElement(Element.DOM)) html += Element.DOM.innerHTML;
        return html + '</' + Tag + '>';
    }
    Element.create = function (tag) {
        tag = typeof tag == 'string' ? tag : Tag;
        let element = document.createElement(Tag);
        Element.DOM = element;
        Element.attr(Attrs);
        return Element;
    };
    Element.into = function (parent) {
        if (isElement(parent) && isElement(Element.DOM)) parent.appendChild(Element.DOM);
        return Element;
    }
    Element.toString = function () {
        return Element.html();
    }

    return Element.apply(this, arguments);
}

tag.isElement = isElement; tag.isNode = isNode;