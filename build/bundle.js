
(function(l, r) { if (!l || l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (self.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(self.document);
var app = (function () {
    'use strict';

    function noop() { }
    const identity = x => x;
    function assign(tar, src) {
        // @ts-ignore
        for (const k in src)
            tar[k] = src[k];
        return tar;
    }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function validate_store(store, name) {
        if (store != null && typeof store.subscribe !== 'function') {
            throw new Error(`'${name}' is not a store with a 'subscribe' method`);
        }
    }
    function subscribe(store, ...callbacks) {
        if (store == null) {
            return noop;
        }
        const unsub = store.subscribe(...callbacks);
        return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
    }
    function component_subscribe(component, store, callback) {
        component.$$.on_destroy.push(subscribe(store, callback));
    }
    function create_slot(definition, ctx, $$scope, fn) {
        if (definition) {
            const slot_ctx = get_slot_context(definition, ctx, $$scope, fn);
            return definition[0](slot_ctx);
        }
    }
    function get_slot_context(definition, ctx, $$scope, fn) {
        return definition[1] && fn
            ? assign($$scope.ctx.slice(), definition[1](fn(ctx)))
            : $$scope.ctx;
    }
    function get_slot_changes(definition, $$scope, dirty, fn) {
        if (definition[2] && fn) {
            const lets = definition[2](fn(dirty));
            if ($$scope.dirty === undefined) {
                return lets;
            }
            if (typeof lets === 'object') {
                const merged = [];
                const len = Math.max($$scope.dirty.length, lets.length);
                for (let i = 0; i < len; i += 1) {
                    merged[i] = $$scope.dirty[i] | lets[i];
                }
                return merged;
            }
            return $$scope.dirty | lets;
        }
        return $$scope.dirty;
    }
    function update_slot_base(slot, slot_definition, ctx, $$scope, slot_changes, get_slot_context_fn) {
        if (slot_changes) {
            const slot_context = get_slot_context(slot_definition, ctx, $$scope, get_slot_context_fn);
            slot.p(slot_context, slot_changes);
        }
    }
    function get_all_dirty_from_scope($$scope) {
        if ($$scope.ctx.length > 32) {
            const dirty = [];
            const length = $$scope.ctx.length / 32;
            for (let i = 0; i < length; i++) {
                dirty[i] = -1;
            }
            return dirty;
        }
        return -1;
    }
    function exclude_internal_props(props) {
        const result = {};
        for (const k in props)
            if (k[0] !== '$')
                result[k] = props[k];
        return result;
    }
    function compute_rest_props(props, keys) {
        const rest = {};
        keys = new Set(keys);
        for (const k in props)
            if (!keys.has(k) && k[0] !== '$')
                rest[k] = props[k];
        return rest;
    }
    function compute_slots(slots) {
        const result = {};
        for (const key in slots) {
            result[key] = true;
        }
        return result;
    }
    function set_store_value(store, ret, value) {
        store.set(value);
        return ret;
    }
    function action_destroyer(action_result) {
        return action_result && is_function(action_result.destroy) ? action_result.destroy : noop;
    }

    const is_client = typeof window !== 'undefined';
    let now = is_client
        ? () => window.performance.now()
        : () => Date.now();
    let raf = is_client ? cb => requestAnimationFrame(cb) : noop;

    const tasks = new Set();
    function run_tasks(now) {
        tasks.forEach(task => {
            if (!task.c(now)) {
                tasks.delete(task);
                task.f();
            }
        });
        if (tasks.size !== 0)
            raf(run_tasks);
    }
    /**
     * Creates a new task that runs on each raf frame
     * until it returns a falsy value or is aborted
     */
    function loop(callback) {
        let task;
        if (tasks.size === 0)
            raf(run_tasks);
        return {
            promise: new Promise(fulfill => {
                tasks.add(task = { c: callback, f: fulfill });
            }),
            abort() {
                tasks.delete(task);
            }
        };
    }
    function append(target, node) {
        target.appendChild(node);
    }
    function get_root_for_style(node) {
        if (!node)
            return document;
        const root = node.getRootNode ? node.getRootNode() : node.ownerDocument;
        if (root && root.host) {
            return root;
        }
        return node.ownerDocument;
    }
    function append_empty_stylesheet(node) {
        const style_element = element('style');
        append_stylesheet(get_root_for_style(node), style_element);
        return style_element.sheet;
    }
    function append_stylesheet(node, style) {
        append(node.head || node, style);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function prevent_default(fn) {
        return function (event) {
            event.preventDefault();
            // @ts-ignore
            return fn.call(this, event);
        };
    }
    function stop_propagation(fn) {
        return function (event) {
            event.stopPropagation();
            // @ts-ignore
            return fn.call(this, event);
        };
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function set_attributes(node, attributes) {
        // @ts-ignore
        const descriptors = Object.getOwnPropertyDescriptors(node.__proto__);
        for (const key in attributes) {
            if (attributes[key] == null) {
                node.removeAttribute(key);
            }
            else if (key === 'style') {
                node.style.cssText = attributes[key];
            }
            else if (key === '__value') {
                node.value = node[key] = attributes[key];
            }
            else if (descriptors[key] && descriptors[key].set) {
                node[key] = attributes[key];
            }
            else {
                attr(node, key, attributes[key]);
            }
        }
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_style(node, key, value, important) {
        if (value === null) {
            node.style.removeProperty(key);
        }
        else {
            node.style.setProperty(key, value, important ? 'important' : '');
        }
    }
    function custom_event(type, detail, bubbles = false) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, bubbles, false, detail);
        return e;
    }

    // we need to store the information for multiple documents because a Svelte application could also contain iframes
    // https://github.com/sveltejs/svelte/issues/3624
    const managed_styles = new Map();
    let active = 0;
    // https://github.com/darkskyapp/string-hash/blob/master/index.js
    function hash(str) {
        let hash = 5381;
        let i = str.length;
        while (i--)
            hash = ((hash << 5) - hash) ^ str.charCodeAt(i);
        return hash >>> 0;
    }
    function create_style_information(doc, node) {
        const info = { stylesheet: append_empty_stylesheet(node), rules: {} };
        managed_styles.set(doc, info);
        return info;
    }
    function create_rule(node, a, b, duration, delay, ease, fn, uid = 0) {
        const step = 16.666 / duration;
        let keyframes = '{\n';
        for (let p = 0; p <= 1; p += step) {
            const t = a + (b - a) * ease(p);
            keyframes += p * 100 + `%{${fn(t, 1 - t)}}\n`;
        }
        const rule = keyframes + `100% {${fn(b, 1 - b)}}\n}`;
        const name = `__svelte_${hash(rule)}_${uid}`;
        const doc = get_root_for_style(node);
        const { stylesheet, rules } = managed_styles.get(doc) || create_style_information(doc, node);
        if (!rules[name]) {
            rules[name] = true;
            stylesheet.insertRule(`@keyframes ${name} ${rule}`, stylesheet.cssRules.length);
        }
        const animation = node.style.animation || '';
        node.style.animation = `${animation ? `${animation}, ` : ''}${name} ${duration}ms linear ${delay}ms 1 both`;
        active += 1;
        return name;
    }
    function delete_rule(node, name) {
        const previous = (node.style.animation || '').split(', ');
        const next = previous.filter(name
            ? anim => anim.indexOf(name) < 0 // remove specific animation
            : anim => anim.indexOf('__svelte') === -1 // remove all Svelte animations
        );
        const deleted = previous.length - next.length;
        if (deleted) {
            node.style.animation = next.join(', ');
            active -= deleted;
            if (!active)
                clear_rules();
        }
    }
    function clear_rules() {
        raf(() => {
            if (active)
                return;
            managed_styles.forEach(info => {
                const { stylesheet } = info;
                let i = stylesheet.cssRules.length;
                while (i--)
                    stylesheet.deleteRule(i);
                info.rules = {};
            });
            managed_styles.clear();
        });
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error('Function called outside component initialization');
        return current_component;
    }
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
    }
    function onDestroy(fn) {
        get_current_component().$$.on_destroy.push(fn);
    }
    function setContext(key, context) {
        get_current_component().$$.context.set(key, context);
    }
    function getContext(key) {
        return get_current_component().$$.context.get(key);
    }
    // TODO figure out if we still want to support
    // shorthand events, or if we want to implement
    // a real bubbling mechanism
    function bubble(component, event) {
        const callbacks = component.$$.callbacks[event.type];
        if (callbacks) {
            // @ts-ignore
            callbacks.slice().forEach(fn => fn.call(this, event));
        }
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function tick() {
        schedule_update();
        return resolved_promise;
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    function add_flush_callback(fn) {
        flush_callbacks.push(fn);
    }
    // flush() calls callbacks in this order:
    // 1. All beforeUpdate callbacks, in order: parents before children
    // 2. All bind:this callbacks, in reverse order: children before parents.
    // 3. All afterUpdate callbacks, in order: parents before children. EXCEPT
    //    for afterUpdates called during the initial onMount, which are called in
    //    reverse order: children before parents.
    // Since callbacks might update component values, which could trigger another
    // call to flush(), the following steps guard against this:
    // 1. During beforeUpdate, any updated components will be added to the
    //    dirty_components array and will cause a reentrant call to flush(). Because
    //    the flush index is kept outside the function, the reentrant call will pick
    //    up where the earlier call left off and go through all dirty components. The
    //    current_component value is saved and restored so that the reentrant call will
    //    not interfere with the "parent" flush() call.
    // 2. bind:this callbacks cannot trigger new flush() calls.
    // 3. During afterUpdate, any updated components will NOT have their afterUpdate
    //    callback called a second time; the seen_callbacks set, outside the flush()
    //    function, guarantees this behavior.
    const seen_callbacks = new Set();
    let flushidx = 0; // Do *not* move this inside the flush() function
    function flush() {
        const saved_component = current_component;
        do {
            // first, call beforeUpdate functions
            // and update components
            while (flushidx < dirty_components.length) {
                const component = dirty_components[flushidx];
                flushidx++;
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            flushidx = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        seen_callbacks.clear();
        set_current_component(saved_component);
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }

    let promise;
    function wait() {
        if (!promise) {
            promise = Promise.resolve();
            promise.then(() => {
                promise = null;
            });
        }
        return promise;
    }
    function dispatch$1(node, direction, kind) {
        node.dispatchEvent(custom_event(`${direction ? 'intro' : 'outro'}${kind}`));
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }
    const null_transition = { duration: 0 };
    function create_in_transition(node, fn, params) {
        let config = fn(node, params);
        let running = false;
        let animation_name;
        let task;
        let uid = 0;
        function cleanup() {
            if (animation_name)
                delete_rule(node, animation_name);
        }
        function go() {
            const { delay = 0, duration = 300, easing = identity, tick = noop, css } = config || null_transition;
            if (css)
                animation_name = create_rule(node, 0, 1, duration, delay, easing, css, uid++);
            tick(0, 1);
            const start_time = now() + delay;
            const end_time = start_time + duration;
            if (task)
                task.abort();
            running = true;
            add_render_callback(() => dispatch$1(node, true, 'start'));
            task = loop(now => {
                if (running) {
                    if (now >= end_time) {
                        tick(1, 0);
                        dispatch$1(node, true, 'end');
                        cleanup();
                        return running = false;
                    }
                    if (now >= start_time) {
                        const t = easing((now - start_time) / duration);
                        tick(t, 1 - t);
                    }
                }
                return running;
            });
        }
        let started = false;
        return {
            start() {
                if (started)
                    return;
                started = true;
                delete_rule(node);
                if (is_function(config)) {
                    config = config();
                    wait().then(go);
                }
                else {
                    go();
                }
            },
            invalidate() {
                started = false;
            },
            end() {
                if (running) {
                    cleanup();
                    running = false;
                }
            }
        };
    }
    function create_out_transition(node, fn, params) {
        let config = fn(node, params);
        let running = true;
        let animation_name;
        const group = outros;
        group.r += 1;
        function go() {
            const { delay = 0, duration = 300, easing = identity, tick = noop, css } = config || null_transition;
            if (css)
                animation_name = create_rule(node, 1, 0, duration, delay, easing, css);
            const start_time = now() + delay;
            const end_time = start_time + duration;
            add_render_callback(() => dispatch$1(node, false, 'start'));
            loop(now => {
                if (running) {
                    if (now >= end_time) {
                        tick(0, 1);
                        dispatch$1(node, false, 'end');
                        if (!--group.r) {
                            // this will result in `end()` being called,
                            // so we don't need to clean up here
                            run_all(group.c);
                        }
                        return false;
                    }
                    if (now >= start_time) {
                        const t = easing((now - start_time) / duration);
                        tick(1 - t, t);
                    }
                }
                return running;
            });
        }
        if (is_function(config)) {
            wait().then(() => {
                // @ts-ignore
                config = config();
                go();
            });
        }
        else {
            go();
        }
        return {
            end(reset) {
                if (reset && config.tick) {
                    config.tick(1, 0);
                }
                if (running) {
                    if (animation_name)
                        delete_rule(node, animation_name);
                    running = false;
                }
            }
        };
    }

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);
    function outro_and_destroy_block(block, lookup) {
        transition_out(block, 1, 1, () => {
            lookup.delete(block.key);
        });
    }
    function update_keyed_each(old_blocks, dirty, get_key, dynamic, ctx, list, lookup, node, destroy, create_each_block, next, get_context) {
        let o = old_blocks.length;
        let n = list.length;
        let i = o;
        const old_indexes = {};
        while (i--)
            old_indexes[old_blocks[i].key] = i;
        const new_blocks = [];
        const new_lookup = new Map();
        const deltas = new Map();
        i = n;
        while (i--) {
            const child_ctx = get_context(ctx, list, i);
            const key = get_key(child_ctx);
            let block = lookup.get(key);
            if (!block) {
                block = create_each_block(key, child_ctx);
                block.c();
            }
            else if (dynamic) {
                block.p(child_ctx, dirty);
            }
            new_lookup.set(key, new_blocks[i] = block);
            if (key in old_indexes)
                deltas.set(key, Math.abs(i - old_indexes[key]));
        }
        const will_move = new Set();
        const did_move = new Set();
        function insert(block) {
            transition_in(block, 1);
            block.m(node, next);
            lookup.set(block.key, block);
            next = block.first;
            n--;
        }
        while (o && n) {
            const new_block = new_blocks[n - 1];
            const old_block = old_blocks[o - 1];
            const new_key = new_block.key;
            const old_key = old_block.key;
            if (new_block === old_block) {
                // do nothing
                next = new_block.first;
                o--;
                n--;
            }
            else if (!new_lookup.has(old_key)) {
                // remove old block
                destroy(old_block, lookup);
                o--;
            }
            else if (!lookup.has(new_key) || will_move.has(new_key)) {
                insert(new_block);
            }
            else if (did_move.has(old_key)) {
                o--;
            }
            else if (deltas.get(new_key) > deltas.get(old_key)) {
                did_move.add(new_key);
                insert(new_block);
            }
            else {
                will_move.add(old_key);
                o--;
            }
        }
        while (o--) {
            const old_block = old_blocks[o];
            if (!new_lookup.has(old_block.key))
                destroy(old_block, lookup);
        }
        while (n)
            insert(new_blocks[n - 1]);
        return new_blocks;
    }
    function validate_each_keys(ctx, list, get_context, get_key) {
        const keys = new Set();
        for (let i = 0; i < list.length; i++) {
            const key = get_key(get_context(ctx, list, i));
            if (keys.has(key)) {
                throw new Error('Cannot have duplicate keys in a keyed each');
            }
            keys.add(key);
        }
    }

    function get_spread_update(levels, updates) {
        const update = {};
        const to_null_out = {};
        const accounted_for = { $$scope: 1 };
        let i = levels.length;
        while (i--) {
            const o = levels[i];
            const n = updates[i];
            if (n) {
                for (const key in o) {
                    if (!(key in n))
                        to_null_out[key] = 1;
                }
                for (const key in n) {
                    if (!accounted_for[key]) {
                        update[key] = n[key];
                        accounted_for[key] = 1;
                    }
                }
                levels[i] = n;
            }
            else {
                for (const key in o) {
                    accounted_for[key] = 1;
                }
            }
        }
        for (const key in to_null_out) {
            if (!(key in update))
                update[key] = undefined;
        }
        return update;
    }
    function get_spread_object(spread_props) {
        return typeof spread_props === 'object' && spread_props !== null ? spread_props : {};
    }

    function bind(component, name, callback) {
        const index = component.$$.props[name];
        if (index !== undefined) {
            component.$$.bound[index] = callback;
            callback(component.$$.ctx[index]);
        }
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor, customElement) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        if (!customElement) {
            // onMount happens before the initial afterUpdate
            add_render_callback(() => {
                const new_on_destroy = on_mount.map(run).filter(is_function);
                if (on_destroy) {
                    on_destroy.push(...new_on_destroy);
                }
                else {
                    // Edge case - component was destroyed immediately,
                    // most likely as a result of a binding initialising
                    run_all(new_on_destroy);
                }
                component.$$.on_mount = [];
            });
        }
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, append_styles, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            on_disconnect: [],
            before_update: [],
            after_update: [],
            context: new Map(options.context || (parent_component ? parent_component.$$.context : [])),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false,
            root: options.target || parent_component.$$.root
        };
        append_styles && append_styles($$.root);
        let ready = false;
        $$.ctx = instance
            ? instance(component, options.props || {}, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor, options.customElement);
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.46.4' }, detail), true));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.wholeText === data)
            return;
        dispatch_dev('SvelteDOMSetData', { node: text, data });
        text.data = data;
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    const subscriber_queue = [];
    /**
     * Creates a `Readable` store that allows reading by subscription.
     * @param value initial value
     * @param {StartStopNotifier}start start and stop notifications for subscriptions
     */
    function readable(value, start) {
        return {
            subscribe: writable(value, start).subscribe
        };
    }
    /**
     * Create a `Writable` store that allows both updating and reading by subscription.
     * @param {*=}value initial value
     * @param {StartStopNotifier=}start start and stop notifications for subscriptions
     */
    function writable(value, start = noop) {
        let stop;
        const subscribers = new Set();
        function set(new_value) {
            if (safe_not_equal(value, new_value)) {
                value = new_value;
                if (stop) { // store is ready
                    const run_queue = !subscriber_queue.length;
                    for (const subscriber of subscribers) {
                        subscriber[1]();
                        subscriber_queue.push(subscriber, value);
                    }
                    if (run_queue) {
                        for (let i = 0; i < subscriber_queue.length; i += 2) {
                            subscriber_queue[i][0](subscriber_queue[i + 1]);
                        }
                        subscriber_queue.length = 0;
                    }
                }
            }
        }
        function update(fn) {
            set(fn(value));
        }
        function subscribe(run, invalidate = noop) {
            const subscriber = [run, invalidate];
            subscribers.add(subscriber);
            if (subscribers.size === 1) {
                stop = start(set) || noop;
            }
            run(value);
            return () => {
                subscribers.delete(subscriber);
                if (subscribers.size === 0) {
                    stop();
                    stop = null;
                }
            };
        }
        return { set, update, subscribe };
    }

    var data$1 = { title:"Customer feedback",
      who:{ question:"Do you want to report this with us (internally), the Better Business Bureau, or Santa Claus?",
        choices:{ Us:"how",
          BBB:"bbb-info",
          "Santa Claus":"santa-info" },
        learnMore:"https://www.google.com/search?q=customer+complaint" },
      how:{ question:"Do you want to use your mobile phone or your computer?",
        choices:{ "Mobile phone":"mobile-phone",
          Computer:"browser-how-to",
          Telegraph:"telegraph",
          "Smoke-signals":"smoke-signals" } },
      "mobile-phone":{ question:"Are you using the mobile app or the web browser on the mobile phone?",
        choices:{ "Mobile App":"mobile-app-how-to",
          "Mobile Web Browser":"browser-how-to" },
        learnMore:"https://www.google.com/search?q=app+learn+more" },
      "mobile-app-how-to":"1) Take mobile phone out of fanny pack\n2) Unlock mobile phone\n3) Find app\n4) Click on app\n5) Use app\n",
      "bbb-info":"1) open browser\n2) Browse to: https://www.bbb.org/file-a-complaint\n3) Follow instructions\n",
      "santa-info":"1) Put your left hand in\n2) Put your left hand out\n3) Put your left hand in\n4) Shake it all about\n5) Do the hoky poky\n6) Turn yourself around\n7 That's what it's all about\n",
      "browser-how-to":"1) Open browser\n4) Enter URL: https://www.google.com/search?q=file-complaint\n5) Follow instructions\n",
      telegraph:"1) Find telegraph\n2) . . . _ _ _ . . .\n",
      "smoke-signals":"1) Find mountain with direct-line-of-sight to target audience\n2) Climb the mountain\n2) Start fire\n3) o o o O O O o o o\n" };
    data$1.title;
    data$1.who;
    data$1.how;
    data$1.telegraph;

    var data = { title:"Turn on lights",
      which:{ question:"Which lights do you want to turn on?",
        choices:{ kitchen:"inOut",
          pantry:"pantryLights",
          backyard:"backyardLights" } },
      inOut:{ question:"Are you inside or outside of the room?",
        choices:{ inside:"flickSwitch",
          outside:"openClosed",
          "too dark to be sure":"tooDark" },
        learnMore:"http://wiki.abco.com/too-dark-tips" },
      openClosed:{ question:"Is the door to the room open or closed?",
        choices:{ open:"enterDoor",
          closed:"openDoor",
          "I can't see":"cantSee" } },
      webBrowserHowTo:"cmsKey://WebBrowserHowToCmsKey",
      backyardLights:"http://wiki.abco.com/backyard-lights",
      pantryLights:"http://wiki.abco.com/pantry-lights",
      flickSwitch:"http://wiki.abco.com/flick-switch",
      enterDoor:"http://wiki.abco.com/enter-door",
      openDoor:"http://wiki.abco.com/open-door",
      cantSee:"http://wiki.abco.com/cant-see",
      tooDark:"http://wiki.abco.com/too-dark" };
    data.title;
    data.which;
    data.inOut;
    data.openClosed;
    data.webBrowserHowTo;
    data.backyardLights;
    data.pantryLights;
    data.flickSwitch;
    data.enterDoor;
    data.openDoor;
    data.cantSee;
    data.tooDark;

    const guideData = readable(undefined, (set) => {
        set([data$1, data]);
        return () => {console.log('guideData.stop');}
    });

    /*! *****************************************************************************
    Copyright (c) Microsoft Corporation.

    Permission to use, copy, modify, and/or distribute this software for any
    purpose with or without fee is hereby granted.

    THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
    REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
    AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
    INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
    LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
    OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
    PERFORMANCE OF THIS SOFTWARE.
    ***************************************************************************** */
    /* global Reflect, Promise */

    var extendStatics = function(d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };

    function __extends(d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    }

    var __assign = function() {
        __assign = Object.assign || function __assign(t) {
            for (var s, i = 1, n = arguments.length; i < n; i++) {
                s = arguments[i];
                for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
            }
            return t;
        };
        return __assign.apply(this, arguments);
    };

    function __values(o) {
        var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
        if (m) return m.call(o);
        if (o && typeof o.length === "number") return {
            next: function () {
                if (o && i >= o.length) o = void 0;
                return { value: o && o[i++], done: !o };
            }
        };
        throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
    }

    /**
     * @license
     * Copyright 2016 Google Inc.
     *
     * Permission is hereby granted, free of charge, to any person obtaining a copy
     * of this software and associated documentation files (the "Software"), to deal
     * in the Software without restriction, including without limitation the rights
     * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
     * copies of the Software, and to permit persons to whom the Software is
     * furnished to do so, subject to the following conditions:
     *
     * The above copyright notice and this permission notice shall be included in
     * all copies or substantial portions of the Software.
     *
     * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
     * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
     * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
     * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
     * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
     * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
     * THE SOFTWARE.
     */
    var MDCFoundation = /** @class */ (function () {
        function MDCFoundation(adapter) {
            if (adapter === void 0) { adapter = {}; }
            this.adapter = adapter;
        }
        Object.defineProperty(MDCFoundation, "cssClasses", {
            get: function () {
                // Classes extending MDCFoundation should implement this method to return an object which exports every
                // CSS class the foundation class needs as a property. e.g. {ACTIVE: 'mdc-component--active'}
                return {};
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(MDCFoundation, "strings", {
            get: function () {
                // Classes extending MDCFoundation should implement this method to return an object which exports all
                // semantic strings as constants. e.g. {ARIA_ROLE: 'tablist'}
                return {};
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(MDCFoundation, "numbers", {
            get: function () {
                // Classes extending MDCFoundation should implement this method to return an object which exports all
                // of its semantic numbers as constants. e.g. {ANIMATION_DELAY_MS: 350}
                return {};
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(MDCFoundation, "defaultAdapter", {
            get: function () {
                // Classes extending MDCFoundation may choose to implement this getter in order to provide a convenient
                // way of viewing the necessary methods of an adapter. In the future, this could also be used for adapter
                // validation.
                return {};
            },
            enumerable: false,
            configurable: true
        });
        MDCFoundation.prototype.init = function () {
            // Subclasses should override this method to perform initialization routines (registering events, etc.)
        };
        MDCFoundation.prototype.destroy = function () {
            // Subclasses should override this method to perform de-initialization routines (de-registering events, etc.)
        };
        return MDCFoundation;
    }());

    /**
     * @license
     * Copyright 2019 Google Inc.
     *
     * Permission is hereby granted, free of charge, to any person obtaining a copy
     * of this software and associated documentation files (the "Software"), to deal
     * in the Software without restriction, including without limitation the rights
     * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
     * copies of the Software, and to permit persons to whom the Software is
     * furnished to do so, subject to the following conditions:
     *
     * The above copyright notice and this permission notice shall be included in
     * all copies or substantial portions of the Software.
     *
     * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
     * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
     * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
     * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
     * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
     * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
     * THE SOFTWARE.
     */
    /**
     * Determine whether the current browser supports passive event listeners, and
     * if so, use them.
     */
    function applyPassive$1(globalObj) {
        if (globalObj === void 0) { globalObj = window; }
        return supportsPassiveOption(globalObj) ?
            { passive: true } :
            false;
    }
    function supportsPassiveOption(globalObj) {
        if (globalObj === void 0) { globalObj = window; }
        // See
        // https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener
        var passiveSupported = false;
        try {
            var options = {
                // This function will be called when the browser
                // attempts to access the passive property.
                get passive() {
                    passiveSupported = true;
                    return false;
                }
            };
            var handler = function () { };
            globalObj.document.addEventListener('test', handler, options);
            globalObj.document.removeEventListener('test', handler, options);
        }
        catch (err) {
            passiveSupported = false;
        }
        return passiveSupported;
    }

    var events = /*#__PURE__*/Object.freeze({
        __proto__: null,
        applyPassive: applyPassive$1
    });

    /**
     * @license
     * Copyright 2018 Google Inc.
     *
     * Permission is hereby granted, free of charge, to any person obtaining a copy
     * of this software and associated documentation files (the "Software"), to deal
     * in the Software without restriction, including without limitation the rights
     * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
     * copies of the Software, and to permit persons to whom the Software is
     * furnished to do so, subject to the following conditions:
     *
     * The above copyright notice and this permission notice shall be included in
     * all copies or substantial portions of the Software.
     *
     * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
     * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
     * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
     * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
     * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
     * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
     * THE SOFTWARE.
     */
    /**
     * @fileoverview A "ponyfill" is a polyfill that doesn't modify the global prototype chain.
     * This makes ponyfills safer than traditional polyfills, especially for libraries like MDC.
     */
    function closest(element, selector) {
        if (element.closest) {
            return element.closest(selector);
        }
        var el = element;
        while (el) {
            if (matches$1(el, selector)) {
                return el;
            }
            el = el.parentElement;
        }
        return null;
    }
    function matches$1(element, selector) {
        var nativeMatches = element.matches
            || element.webkitMatchesSelector
            || element.msMatchesSelector;
        return nativeMatches.call(element, selector);
    }
    /**
     * Used to compute the estimated scroll width of elements. When an element is
     * hidden due to display: none; being applied to a parent element, the width is
     * returned as 0. However, the element will have a true width once no longer
     * inside a display: none context. This method computes an estimated width when
     * the element is hidden or returns the true width when the element is visble.
     * @param {Element} element the element whose width to estimate
     */
    function estimateScrollWidth(element) {
        // Check the offsetParent. If the element inherits display: none from any
        // parent, the offsetParent property will be null (see
        // https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/offsetParent).
        // This check ensures we only clone the node when necessary.
        var htmlEl = element;
        if (htmlEl.offsetParent !== null) {
            return htmlEl.scrollWidth;
        }
        var clone = htmlEl.cloneNode(true);
        clone.style.setProperty('position', 'absolute');
        clone.style.setProperty('transform', 'translate(-9999px, -9999px)');
        document.documentElement.appendChild(clone);
        var scrollWidth = clone.scrollWidth;
        document.documentElement.removeChild(clone);
        return scrollWidth;
    }

    var ponyfill = /*#__PURE__*/Object.freeze({
        __proto__: null,
        closest: closest,
        matches: matches$1,
        estimateScrollWidth: estimateScrollWidth
    });

    /**
     * @license
     * Copyright 2016 Google Inc.
     *
     * Permission is hereby granted, free of charge, to any person obtaining a copy
     * of this software and associated documentation files (the "Software"), to deal
     * in the Software without restriction, including without limitation the rights
     * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
     * copies of the Software, and to permit persons to whom the Software is
     * furnished to do so, subject to the following conditions:
     *
     * The above copyright notice and this permission notice shall be included in
     * all copies or substantial portions of the Software.
     *
     * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
     * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
     * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
     * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
     * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
     * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
     * THE SOFTWARE.
     */
    var cssClasses$8 = {
        // Ripple is a special case where the "root" component is really a "mixin" of sorts,
        // given that it's an 'upgrade' to an existing component. That being said it is the root
        // CSS class that all other CSS classes derive from.
        BG_FOCUSED: 'mdc-ripple-upgraded--background-focused',
        FG_ACTIVATION: 'mdc-ripple-upgraded--foreground-activation',
        FG_DEACTIVATION: 'mdc-ripple-upgraded--foreground-deactivation',
        ROOT: 'mdc-ripple-upgraded',
        UNBOUNDED: 'mdc-ripple-upgraded--unbounded',
    };
    var strings$5 = {
        VAR_FG_SCALE: '--mdc-ripple-fg-scale',
        VAR_FG_SIZE: '--mdc-ripple-fg-size',
        VAR_FG_TRANSLATE_END: '--mdc-ripple-fg-translate-end',
        VAR_FG_TRANSLATE_START: '--mdc-ripple-fg-translate-start',
        VAR_LEFT: '--mdc-ripple-left',
        VAR_TOP: '--mdc-ripple-top',
    };
    var numbers$5 = {
        DEACTIVATION_TIMEOUT_MS: 225,
        FG_DEACTIVATION_MS: 150,
        INITIAL_ORIGIN_SCALE: 0.6,
        PADDING: 10,
        TAP_DELAY_MS: 300, // Delay between touch and simulated mouse events on touch devices
    };

    /**
     * Stores result from supportsCssVariables to avoid redundant processing to
     * detect CSS custom variable support.
     */
    var supportsCssVariables_;
    function supportsCssVariables(windowObj, forceRefresh) {
        if (forceRefresh === void 0) { forceRefresh = false; }
        var CSS = windowObj.CSS;
        var supportsCssVars = supportsCssVariables_;
        if (typeof supportsCssVariables_ === 'boolean' && !forceRefresh) {
            return supportsCssVariables_;
        }
        var supportsFunctionPresent = CSS && typeof CSS.supports === 'function';
        if (!supportsFunctionPresent) {
            return false;
        }
        var explicitlySupportsCssVars = CSS.supports('--css-vars', 'yes');
        // See: https://bugs.webkit.org/show_bug.cgi?id=154669
        // See: README section on Safari
        var weAreFeatureDetectingSafari10plus = (CSS.supports('(--css-vars: yes)') &&
            CSS.supports('color', '#00000000'));
        supportsCssVars =
            explicitlySupportsCssVars || weAreFeatureDetectingSafari10plus;
        if (!forceRefresh) {
            supportsCssVariables_ = supportsCssVars;
        }
        return supportsCssVars;
    }
    function getNormalizedEventCoords(evt, pageOffset, clientRect) {
        if (!evt) {
            return { x: 0, y: 0 };
        }
        var x = pageOffset.x, y = pageOffset.y;
        var documentX = x + clientRect.left;
        var documentY = y + clientRect.top;
        var normalizedX;
        var normalizedY;
        // Determine touch point relative to the ripple container.
        if (evt.type === 'touchstart') {
            var touchEvent = evt;
            normalizedX = touchEvent.changedTouches[0].pageX - documentX;
            normalizedY = touchEvent.changedTouches[0].pageY - documentY;
        }
        else {
            var mouseEvent = evt;
            normalizedX = mouseEvent.pageX - documentX;
            normalizedY = mouseEvent.pageY - documentY;
        }
        return { x: normalizedX, y: normalizedY };
    }

    /**
     * @license
     * Copyright 2016 Google Inc.
     *
     * Permission is hereby granted, free of charge, to any person obtaining a copy
     * of this software and associated documentation files (the "Software"), to deal
     * in the Software without restriction, including without limitation the rights
     * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
     * copies of the Software, and to permit persons to whom the Software is
     * furnished to do so, subject to the following conditions:
     *
     * The above copyright notice and this permission notice shall be included in
     * all copies or substantial portions of the Software.
     *
     * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
     * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
     * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
     * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
     * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
     * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
     * THE SOFTWARE.
     */
    // Activation events registered on the root element of each instance for activation
    var ACTIVATION_EVENT_TYPES = [
        'touchstart', 'pointerdown', 'mousedown', 'keydown',
    ];
    // Deactivation events registered on documentElement when a pointer-related down event occurs
    var POINTER_DEACTIVATION_EVENT_TYPES = [
        'touchend', 'pointerup', 'mouseup', 'contextmenu',
    ];
    // simultaneous nested activations
    var activatedTargets = [];
    var MDCRippleFoundation = /** @class */ (function (_super) {
        __extends(MDCRippleFoundation, _super);
        function MDCRippleFoundation(adapter) {
            var _this = _super.call(this, __assign(__assign({}, MDCRippleFoundation.defaultAdapter), adapter)) || this;
            _this.activationAnimationHasEnded = false;
            _this.activationTimer = 0;
            _this.fgDeactivationRemovalTimer = 0;
            _this.fgScale = '0';
            _this.frame = { width: 0, height: 0 };
            _this.initialSize = 0;
            _this.layoutFrame = 0;
            _this.maxRadius = 0;
            _this.unboundedCoords = { left: 0, top: 0 };
            _this.activationState = _this.defaultActivationState();
            _this.activationTimerCallback = function () {
                _this.activationAnimationHasEnded = true;
                _this.runDeactivationUXLogicIfReady();
            };
            _this.activateHandler = function (e) {
                _this.activateImpl(e);
            };
            _this.deactivateHandler = function () {
                _this.deactivateImpl();
            };
            _this.focusHandler = function () {
                _this.handleFocus();
            };
            _this.blurHandler = function () {
                _this.handleBlur();
            };
            _this.resizeHandler = function () {
                _this.layout();
            };
            return _this;
        }
        Object.defineProperty(MDCRippleFoundation, "cssClasses", {
            get: function () {
                return cssClasses$8;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(MDCRippleFoundation, "strings", {
            get: function () {
                return strings$5;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(MDCRippleFoundation, "numbers", {
            get: function () {
                return numbers$5;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(MDCRippleFoundation, "defaultAdapter", {
            get: function () {
                return {
                    addClass: function () { return undefined; },
                    browserSupportsCssVars: function () { return true; },
                    computeBoundingRect: function () {
                        return ({ top: 0, right: 0, bottom: 0, left: 0, width: 0, height: 0 });
                    },
                    containsEventTarget: function () { return true; },
                    deregisterDocumentInteractionHandler: function () { return undefined; },
                    deregisterInteractionHandler: function () { return undefined; },
                    deregisterResizeHandler: function () { return undefined; },
                    getWindowPageOffset: function () { return ({ x: 0, y: 0 }); },
                    isSurfaceActive: function () { return true; },
                    isSurfaceDisabled: function () { return true; },
                    isUnbounded: function () { return true; },
                    registerDocumentInteractionHandler: function () { return undefined; },
                    registerInteractionHandler: function () { return undefined; },
                    registerResizeHandler: function () { return undefined; },
                    removeClass: function () { return undefined; },
                    updateCssVariable: function () { return undefined; },
                };
            },
            enumerable: false,
            configurable: true
        });
        MDCRippleFoundation.prototype.init = function () {
            var _this = this;
            var supportsPressRipple = this.supportsPressRipple();
            this.registerRootHandlers(supportsPressRipple);
            if (supportsPressRipple) {
                var _a = MDCRippleFoundation.cssClasses, ROOT_1 = _a.ROOT, UNBOUNDED_1 = _a.UNBOUNDED;
                requestAnimationFrame(function () {
                    _this.adapter.addClass(ROOT_1);
                    if (_this.adapter.isUnbounded()) {
                        _this.adapter.addClass(UNBOUNDED_1);
                        // Unbounded ripples need layout logic applied immediately to set coordinates for both shade and ripple
                        _this.layoutInternal();
                    }
                });
            }
        };
        MDCRippleFoundation.prototype.destroy = function () {
            var _this = this;
            if (this.supportsPressRipple()) {
                if (this.activationTimer) {
                    clearTimeout(this.activationTimer);
                    this.activationTimer = 0;
                    this.adapter.removeClass(MDCRippleFoundation.cssClasses.FG_ACTIVATION);
                }
                if (this.fgDeactivationRemovalTimer) {
                    clearTimeout(this.fgDeactivationRemovalTimer);
                    this.fgDeactivationRemovalTimer = 0;
                    this.adapter.removeClass(MDCRippleFoundation.cssClasses.FG_DEACTIVATION);
                }
                var _a = MDCRippleFoundation.cssClasses, ROOT_2 = _a.ROOT, UNBOUNDED_2 = _a.UNBOUNDED;
                requestAnimationFrame(function () {
                    _this.adapter.removeClass(ROOT_2);
                    _this.adapter.removeClass(UNBOUNDED_2);
                    _this.removeCssVars();
                });
            }
            this.deregisterRootHandlers();
            this.deregisterDeactivationHandlers();
        };
        /**
         * @param evt Optional event containing position information.
         */
        MDCRippleFoundation.prototype.activate = function (evt) {
            this.activateImpl(evt);
        };
        MDCRippleFoundation.prototype.deactivate = function () {
            this.deactivateImpl();
        };
        MDCRippleFoundation.prototype.layout = function () {
            var _this = this;
            if (this.layoutFrame) {
                cancelAnimationFrame(this.layoutFrame);
            }
            this.layoutFrame = requestAnimationFrame(function () {
                _this.layoutInternal();
                _this.layoutFrame = 0;
            });
        };
        MDCRippleFoundation.prototype.setUnbounded = function (unbounded) {
            var UNBOUNDED = MDCRippleFoundation.cssClasses.UNBOUNDED;
            if (unbounded) {
                this.adapter.addClass(UNBOUNDED);
            }
            else {
                this.adapter.removeClass(UNBOUNDED);
            }
        };
        MDCRippleFoundation.prototype.handleFocus = function () {
            var _this = this;
            requestAnimationFrame(function () { return _this.adapter.addClass(MDCRippleFoundation.cssClasses.BG_FOCUSED); });
        };
        MDCRippleFoundation.prototype.handleBlur = function () {
            var _this = this;
            requestAnimationFrame(function () { return _this.adapter.removeClass(MDCRippleFoundation.cssClasses.BG_FOCUSED); });
        };
        /**
         * We compute this property so that we are not querying information about the client
         * until the point in time where the foundation requests it. This prevents scenarios where
         * client-side feature-detection may happen too early, such as when components are rendered on the server
         * and then initialized at mount time on the client.
         */
        MDCRippleFoundation.prototype.supportsPressRipple = function () {
            return this.adapter.browserSupportsCssVars();
        };
        MDCRippleFoundation.prototype.defaultActivationState = function () {
            return {
                activationEvent: undefined,
                hasDeactivationUXRun: false,
                isActivated: false,
                isProgrammatic: false,
                wasActivatedByPointer: false,
                wasElementMadeActive: false,
            };
        };
        /**
         * supportsPressRipple Passed from init to save a redundant function call
         */
        MDCRippleFoundation.prototype.registerRootHandlers = function (supportsPressRipple) {
            var e_1, _a;
            if (supportsPressRipple) {
                try {
                    for (var ACTIVATION_EVENT_TYPES_1 = __values(ACTIVATION_EVENT_TYPES), ACTIVATION_EVENT_TYPES_1_1 = ACTIVATION_EVENT_TYPES_1.next(); !ACTIVATION_EVENT_TYPES_1_1.done; ACTIVATION_EVENT_TYPES_1_1 = ACTIVATION_EVENT_TYPES_1.next()) {
                        var evtType = ACTIVATION_EVENT_TYPES_1_1.value;
                        this.adapter.registerInteractionHandler(evtType, this.activateHandler);
                    }
                }
                catch (e_1_1) { e_1 = { error: e_1_1 }; }
                finally {
                    try {
                        if (ACTIVATION_EVENT_TYPES_1_1 && !ACTIVATION_EVENT_TYPES_1_1.done && (_a = ACTIVATION_EVENT_TYPES_1.return)) _a.call(ACTIVATION_EVENT_TYPES_1);
                    }
                    finally { if (e_1) throw e_1.error; }
                }
                if (this.adapter.isUnbounded()) {
                    this.adapter.registerResizeHandler(this.resizeHandler);
                }
            }
            this.adapter.registerInteractionHandler('focus', this.focusHandler);
            this.adapter.registerInteractionHandler('blur', this.blurHandler);
        };
        MDCRippleFoundation.prototype.registerDeactivationHandlers = function (evt) {
            var e_2, _a;
            if (evt.type === 'keydown') {
                this.adapter.registerInteractionHandler('keyup', this.deactivateHandler);
            }
            else {
                try {
                    for (var POINTER_DEACTIVATION_EVENT_TYPES_1 = __values(POINTER_DEACTIVATION_EVENT_TYPES), POINTER_DEACTIVATION_EVENT_TYPES_1_1 = POINTER_DEACTIVATION_EVENT_TYPES_1.next(); !POINTER_DEACTIVATION_EVENT_TYPES_1_1.done; POINTER_DEACTIVATION_EVENT_TYPES_1_1 = POINTER_DEACTIVATION_EVENT_TYPES_1.next()) {
                        var evtType = POINTER_DEACTIVATION_EVENT_TYPES_1_1.value;
                        this.adapter.registerDocumentInteractionHandler(evtType, this.deactivateHandler);
                    }
                }
                catch (e_2_1) { e_2 = { error: e_2_1 }; }
                finally {
                    try {
                        if (POINTER_DEACTIVATION_EVENT_TYPES_1_1 && !POINTER_DEACTIVATION_EVENT_TYPES_1_1.done && (_a = POINTER_DEACTIVATION_EVENT_TYPES_1.return)) _a.call(POINTER_DEACTIVATION_EVENT_TYPES_1);
                    }
                    finally { if (e_2) throw e_2.error; }
                }
            }
        };
        MDCRippleFoundation.prototype.deregisterRootHandlers = function () {
            var e_3, _a;
            try {
                for (var ACTIVATION_EVENT_TYPES_2 = __values(ACTIVATION_EVENT_TYPES), ACTIVATION_EVENT_TYPES_2_1 = ACTIVATION_EVENT_TYPES_2.next(); !ACTIVATION_EVENT_TYPES_2_1.done; ACTIVATION_EVENT_TYPES_2_1 = ACTIVATION_EVENT_TYPES_2.next()) {
                    var evtType = ACTIVATION_EVENT_TYPES_2_1.value;
                    this.adapter.deregisterInteractionHandler(evtType, this.activateHandler);
                }
            }
            catch (e_3_1) { e_3 = { error: e_3_1 }; }
            finally {
                try {
                    if (ACTIVATION_EVENT_TYPES_2_1 && !ACTIVATION_EVENT_TYPES_2_1.done && (_a = ACTIVATION_EVENT_TYPES_2.return)) _a.call(ACTIVATION_EVENT_TYPES_2);
                }
                finally { if (e_3) throw e_3.error; }
            }
            this.adapter.deregisterInteractionHandler('focus', this.focusHandler);
            this.adapter.deregisterInteractionHandler('blur', this.blurHandler);
            if (this.adapter.isUnbounded()) {
                this.adapter.deregisterResizeHandler(this.resizeHandler);
            }
        };
        MDCRippleFoundation.prototype.deregisterDeactivationHandlers = function () {
            var e_4, _a;
            this.adapter.deregisterInteractionHandler('keyup', this.deactivateHandler);
            try {
                for (var POINTER_DEACTIVATION_EVENT_TYPES_2 = __values(POINTER_DEACTIVATION_EVENT_TYPES), POINTER_DEACTIVATION_EVENT_TYPES_2_1 = POINTER_DEACTIVATION_EVENT_TYPES_2.next(); !POINTER_DEACTIVATION_EVENT_TYPES_2_1.done; POINTER_DEACTIVATION_EVENT_TYPES_2_1 = POINTER_DEACTIVATION_EVENT_TYPES_2.next()) {
                    var evtType = POINTER_DEACTIVATION_EVENT_TYPES_2_1.value;
                    this.adapter.deregisterDocumentInteractionHandler(evtType, this.deactivateHandler);
                }
            }
            catch (e_4_1) { e_4 = { error: e_4_1 }; }
            finally {
                try {
                    if (POINTER_DEACTIVATION_EVENT_TYPES_2_1 && !POINTER_DEACTIVATION_EVENT_TYPES_2_1.done && (_a = POINTER_DEACTIVATION_EVENT_TYPES_2.return)) _a.call(POINTER_DEACTIVATION_EVENT_TYPES_2);
                }
                finally { if (e_4) throw e_4.error; }
            }
        };
        MDCRippleFoundation.prototype.removeCssVars = function () {
            var _this = this;
            var rippleStrings = MDCRippleFoundation.strings;
            var keys = Object.keys(rippleStrings);
            keys.forEach(function (key) {
                if (key.indexOf('VAR_') === 0) {
                    _this.adapter.updateCssVariable(rippleStrings[key], null);
                }
            });
        };
        MDCRippleFoundation.prototype.activateImpl = function (evt) {
            var _this = this;
            if (this.adapter.isSurfaceDisabled()) {
                return;
            }
            var activationState = this.activationState;
            if (activationState.isActivated) {
                return;
            }
            // Avoid reacting to follow-on events fired by touch device after an already-processed user interaction
            var previousActivationEvent = this.previousActivationEvent;
            var isSameInteraction = previousActivationEvent && evt !== undefined && previousActivationEvent.type !== evt.type;
            if (isSameInteraction) {
                return;
            }
            activationState.isActivated = true;
            activationState.isProgrammatic = evt === undefined;
            activationState.activationEvent = evt;
            activationState.wasActivatedByPointer = activationState.isProgrammatic ? false : evt !== undefined && (evt.type === 'mousedown' || evt.type === 'touchstart' || evt.type === 'pointerdown');
            var hasActivatedChild = evt !== undefined &&
                activatedTargets.length > 0 &&
                activatedTargets.some(function (target) { return _this.adapter.containsEventTarget(target); });
            if (hasActivatedChild) {
                // Immediately reset activation state, while preserving logic that prevents touch follow-on events
                this.resetActivationState();
                return;
            }
            if (evt !== undefined) {
                activatedTargets.push(evt.target);
                this.registerDeactivationHandlers(evt);
            }
            activationState.wasElementMadeActive = this.checkElementMadeActive(evt);
            if (activationState.wasElementMadeActive) {
                this.animateActivation();
            }
            requestAnimationFrame(function () {
                // Reset array on next frame after the current event has had a chance to bubble to prevent ancestor ripples
                activatedTargets = [];
                if (!activationState.wasElementMadeActive
                    && evt !== undefined
                    && (evt.key === ' ' || evt.keyCode === 32)) {
                    // If space was pressed, try again within an rAF call to detect :active, because different UAs report
                    // active states inconsistently when they're called within event handling code:
                    // - https://bugs.chromium.org/p/chromium/issues/detail?id=635971
                    // - https://bugzilla.mozilla.org/show_bug.cgi?id=1293741
                    // We try first outside rAF to support Edge, which does not exhibit this problem, but will crash if a CSS
                    // variable is set within a rAF callback for a submit button interaction (#2241).
                    activationState.wasElementMadeActive = _this.checkElementMadeActive(evt);
                    if (activationState.wasElementMadeActive) {
                        _this.animateActivation();
                    }
                }
                if (!activationState.wasElementMadeActive) {
                    // Reset activation state immediately if element was not made active.
                    _this.activationState = _this.defaultActivationState();
                }
            });
        };
        MDCRippleFoundation.prototype.checkElementMadeActive = function (evt) {
            return (evt !== undefined && evt.type === 'keydown') ?
                this.adapter.isSurfaceActive() :
                true;
        };
        MDCRippleFoundation.prototype.animateActivation = function () {
            var _this = this;
            var _a = MDCRippleFoundation.strings, VAR_FG_TRANSLATE_START = _a.VAR_FG_TRANSLATE_START, VAR_FG_TRANSLATE_END = _a.VAR_FG_TRANSLATE_END;
            var _b = MDCRippleFoundation.cssClasses, FG_DEACTIVATION = _b.FG_DEACTIVATION, FG_ACTIVATION = _b.FG_ACTIVATION;
            var DEACTIVATION_TIMEOUT_MS = MDCRippleFoundation.numbers.DEACTIVATION_TIMEOUT_MS;
            this.layoutInternal();
            var translateStart = '';
            var translateEnd = '';
            if (!this.adapter.isUnbounded()) {
                var _c = this.getFgTranslationCoordinates(), startPoint = _c.startPoint, endPoint = _c.endPoint;
                translateStart = startPoint.x + "px, " + startPoint.y + "px";
                translateEnd = endPoint.x + "px, " + endPoint.y + "px";
            }
            this.adapter.updateCssVariable(VAR_FG_TRANSLATE_START, translateStart);
            this.adapter.updateCssVariable(VAR_FG_TRANSLATE_END, translateEnd);
            // Cancel any ongoing activation/deactivation animations
            clearTimeout(this.activationTimer);
            clearTimeout(this.fgDeactivationRemovalTimer);
            this.rmBoundedActivationClasses();
            this.adapter.removeClass(FG_DEACTIVATION);
            // Force layout in order to re-trigger the animation.
            this.adapter.computeBoundingRect();
            this.adapter.addClass(FG_ACTIVATION);
            this.activationTimer = setTimeout(function () {
                _this.activationTimerCallback();
            }, DEACTIVATION_TIMEOUT_MS);
        };
        MDCRippleFoundation.prototype.getFgTranslationCoordinates = function () {
            var _a = this.activationState, activationEvent = _a.activationEvent, wasActivatedByPointer = _a.wasActivatedByPointer;
            var startPoint;
            if (wasActivatedByPointer) {
                startPoint = getNormalizedEventCoords(activationEvent, this.adapter.getWindowPageOffset(), this.adapter.computeBoundingRect());
            }
            else {
                startPoint = {
                    x: this.frame.width / 2,
                    y: this.frame.height / 2,
                };
            }
            // Center the element around the start point.
            startPoint = {
                x: startPoint.x - (this.initialSize / 2),
                y: startPoint.y - (this.initialSize / 2),
            };
            var endPoint = {
                x: (this.frame.width / 2) - (this.initialSize / 2),
                y: (this.frame.height / 2) - (this.initialSize / 2),
            };
            return { startPoint: startPoint, endPoint: endPoint };
        };
        MDCRippleFoundation.prototype.runDeactivationUXLogicIfReady = function () {
            var _this = this;
            // This method is called both when a pointing device is released, and when the activation animation ends.
            // The deactivation animation should only run after both of those occur.
            var FG_DEACTIVATION = MDCRippleFoundation.cssClasses.FG_DEACTIVATION;
            var _a = this.activationState, hasDeactivationUXRun = _a.hasDeactivationUXRun, isActivated = _a.isActivated;
            var activationHasEnded = hasDeactivationUXRun || !isActivated;
            if (activationHasEnded && this.activationAnimationHasEnded) {
                this.rmBoundedActivationClasses();
                this.adapter.addClass(FG_DEACTIVATION);
                this.fgDeactivationRemovalTimer = setTimeout(function () {
                    _this.adapter.removeClass(FG_DEACTIVATION);
                }, numbers$5.FG_DEACTIVATION_MS);
            }
        };
        MDCRippleFoundation.prototype.rmBoundedActivationClasses = function () {
            var FG_ACTIVATION = MDCRippleFoundation.cssClasses.FG_ACTIVATION;
            this.adapter.removeClass(FG_ACTIVATION);
            this.activationAnimationHasEnded = false;
            this.adapter.computeBoundingRect();
        };
        MDCRippleFoundation.prototype.resetActivationState = function () {
            var _this = this;
            this.previousActivationEvent = this.activationState.activationEvent;
            this.activationState = this.defaultActivationState();
            // Touch devices may fire additional events for the same interaction within a short time.
            // Store the previous event until it's safe to assume that subsequent events are for new interactions.
            setTimeout(function () { return _this.previousActivationEvent = undefined; }, MDCRippleFoundation.numbers.TAP_DELAY_MS);
        };
        MDCRippleFoundation.prototype.deactivateImpl = function () {
            var _this = this;
            var activationState = this.activationState;
            // This can happen in scenarios such as when you have a keyup event that blurs the element.
            if (!activationState.isActivated) {
                return;
            }
            var state = __assign({}, activationState);
            if (activationState.isProgrammatic) {
                requestAnimationFrame(function () {
                    _this.animateDeactivation(state);
                });
                this.resetActivationState();
            }
            else {
                this.deregisterDeactivationHandlers();
                requestAnimationFrame(function () {
                    _this.activationState.hasDeactivationUXRun = true;
                    _this.animateDeactivation(state);
                    _this.resetActivationState();
                });
            }
        };
        MDCRippleFoundation.prototype.animateDeactivation = function (_a) {
            var wasActivatedByPointer = _a.wasActivatedByPointer, wasElementMadeActive = _a.wasElementMadeActive;
            if (wasActivatedByPointer || wasElementMadeActive) {
                this.runDeactivationUXLogicIfReady();
            }
        };
        MDCRippleFoundation.prototype.layoutInternal = function () {
            var _this = this;
            this.frame = this.adapter.computeBoundingRect();
            var maxDim = Math.max(this.frame.height, this.frame.width);
            // Surface diameter is treated differently for unbounded vs. bounded ripples.
            // Unbounded ripple diameter is calculated smaller since the surface is expected to already be padded appropriately
            // to extend the hitbox, and the ripple is expected to meet the edges of the padded hitbox (which is typically
            // square). Bounded ripples, on the other hand, are fully expected to expand beyond the surface's longest diameter
            // (calculated based on the diagonal plus a constant padding), and are clipped at the surface's border via
            // `overflow: hidden`.
            var getBoundedRadius = function () {
                var hypotenuse = Math.sqrt(Math.pow(_this.frame.width, 2) + Math.pow(_this.frame.height, 2));
                return hypotenuse + MDCRippleFoundation.numbers.PADDING;
            };
            this.maxRadius = this.adapter.isUnbounded() ? maxDim : getBoundedRadius();
            // Ripple is sized as a fraction of the largest dimension of the surface, then scales up using a CSS scale transform
            var initialSize = Math.floor(maxDim * MDCRippleFoundation.numbers.INITIAL_ORIGIN_SCALE);
            // Unbounded ripple size should always be even number to equally center align.
            if (this.adapter.isUnbounded() && initialSize % 2 !== 0) {
                this.initialSize = initialSize - 1;
            }
            else {
                this.initialSize = initialSize;
            }
            this.fgScale = "" + this.maxRadius / this.initialSize;
            this.updateLayoutCssVars();
        };
        MDCRippleFoundation.prototype.updateLayoutCssVars = function () {
            var _a = MDCRippleFoundation.strings, VAR_FG_SIZE = _a.VAR_FG_SIZE, VAR_LEFT = _a.VAR_LEFT, VAR_TOP = _a.VAR_TOP, VAR_FG_SCALE = _a.VAR_FG_SCALE;
            this.adapter.updateCssVariable(VAR_FG_SIZE, this.initialSize + "px");
            this.adapter.updateCssVariable(VAR_FG_SCALE, this.fgScale);
            if (this.adapter.isUnbounded()) {
                this.unboundedCoords = {
                    left: Math.round((this.frame.width / 2) - (this.initialSize / 2)),
                    top: Math.round((this.frame.height / 2) - (this.initialSize / 2)),
                };
                this.adapter.updateCssVariable(VAR_LEFT, this.unboundedCoords.left + "px");
                this.adapter.updateCssVariable(VAR_TOP, this.unboundedCoords.top + "px");
            }
        };
        return MDCRippleFoundation;
    }(MDCFoundation));

    /**
     * @license
     * Copyright 2018 Google Inc.
     *
     * Permission is hereby granted, free of charge, to any person obtaining a copy
     * of this software and associated documentation files (the "Software"), to deal
     * in the Software without restriction, including without limitation the rights
     * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
     * copies of the Software, and to permit persons to whom the Software is
     * furnished to do so, subject to the following conditions:
     *
     * The above copyright notice and this permission notice shall be included in
     * all copies or substantial portions of the Software.
     *
     * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
     * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
     * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
     * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
     * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
     * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
     * THE SOFTWARE.
     */
    var cssClasses$7 = {
        FIXED_CLASS: 'mdc-top-app-bar--fixed',
        FIXED_SCROLLED_CLASS: 'mdc-top-app-bar--fixed-scrolled',
        SHORT_CLASS: 'mdc-top-app-bar--short',
        SHORT_COLLAPSED_CLASS: 'mdc-top-app-bar--short-collapsed',
        SHORT_HAS_ACTION_ITEM_CLASS: 'mdc-top-app-bar--short-has-action-item',
    };
    var numbers$4 = {
        DEBOUNCE_THROTTLE_RESIZE_TIME_MS: 100,
        MAX_TOP_APP_BAR_HEIGHT: 128,
    };
    var strings$4 = {
        ACTION_ITEM_SELECTOR: '.mdc-top-app-bar__action-item',
        NAVIGATION_EVENT: 'MDCTopAppBar:nav',
        NAVIGATION_ICON_SELECTOR: '.mdc-top-app-bar__navigation-icon',
        ROOT_SELECTOR: '.mdc-top-app-bar',
        TITLE_SELECTOR: '.mdc-top-app-bar__title',
    };

    /**
     * @license
     * Copyright 2018 Google Inc.
     *
     * Permission is hereby granted, free of charge, to any person obtaining a copy
     * of this software and associated documentation files (the "Software"), to deal
     * in the Software without restriction, including without limitation the rights
     * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
     * copies of the Software, and to permit persons to whom the Software is
     * furnished to do so, subject to the following conditions:
     *
     * The above copyright notice and this permission notice shall be included in
     * all copies or substantial portions of the Software.
     *
     * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
     * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
     * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
     * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
     * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
     * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
     * THE SOFTWARE.
     */
    var MDCTopAppBarBaseFoundation = /** @class */ (function (_super) {
        __extends(MDCTopAppBarBaseFoundation, _super);
        /* istanbul ignore next: optional argument is not a branch statement */
        function MDCTopAppBarBaseFoundation(adapter) {
            return _super.call(this, __assign(__assign({}, MDCTopAppBarBaseFoundation.defaultAdapter), adapter)) || this;
        }
        Object.defineProperty(MDCTopAppBarBaseFoundation, "strings", {
            get: function () {
                return strings$4;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(MDCTopAppBarBaseFoundation, "cssClasses", {
            get: function () {
                return cssClasses$7;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(MDCTopAppBarBaseFoundation, "numbers", {
            get: function () {
                return numbers$4;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(MDCTopAppBarBaseFoundation, "defaultAdapter", {
            /**
             * See {@link MDCTopAppBarAdapter} for typing information on parameters and return types.
             */
            get: function () {
                // tslint:disable:object-literal-sort-keys Methods should be in the same order as the adapter interface.
                return {
                    addClass: function () { return undefined; },
                    removeClass: function () { return undefined; },
                    hasClass: function () { return false; },
                    setStyle: function () { return undefined; },
                    getTopAppBarHeight: function () { return 0; },
                    notifyNavigationIconClicked: function () { return undefined; },
                    getViewportScrollY: function () { return 0; },
                    getTotalActionItems: function () { return 0; },
                };
                // tslint:enable:object-literal-sort-keys
            },
            enumerable: false,
            configurable: true
        });
        /** Other variants of TopAppBar foundation overrides this method */
        MDCTopAppBarBaseFoundation.prototype.handleTargetScroll = function () { }; // tslint:disable-line:no-empty
        /** Other variants of TopAppBar foundation overrides this method */
        MDCTopAppBarBaseFoundation.prototype.handleWindowResize = function () { }; // tslint:disable-line:no-empty
        MDCTopAppBarBaseFoundation.prototype.handleNavigationClick = function () {
            this.adapter.notifyNavigationIconClicked();
        };
        return MDCTopAppBarBaseFoundation;
    }(MDCFoundation));

    /**
     * @license
     * Copyright 2018 Google Inc.
     *
     * Permission is hereby granted, free of charge, to any person obtaining a copy
     * of this software and associated documentation files (the "Software"), to deal
     * in the Software without restriction, including without limitation the rights
     * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
     * copies of the Software, and to permit persons to whom the Software is
     * furnished to do so, subject to the following conditions:
     *
     * The above copyright notice and this permission notice shall be included in
     * all copies or substantial portions of the Software.
     *
     * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
     * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
     * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
     * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
     * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
     * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
     * THE SOFTWARE.
     */
    var INITIAL_VALUE = 0;
    var MDCTopAppBarFoundation = /** @class */ (function (_super) {
        __extends(MDCTopAppBarFoundation, _super);
        /* istanbul ignore next: optional argument is not a branch statement */
        function MDCTopAppBarFoundation(adapter) {
            var _this = _super.call(this, adapter) || this;
            /**
             * Indicates if the top app bar was docked in the previous scroll handler iteration.
             */
            _this.wasDocked = true;
            /**
             * Indicates if the top app bar is docked in the fully shown position.
             */
            _this.isDockedShowing = true;
            /**
             * Variable for current scroll position of the top app bar
             */
            _this.currentAppBarOffsetTop = 0;
            /**
             * Used to prevent the top app bar from being scrolled out of view during resize events
             */
            _this.isCurrentlyBeingResized = false;
            /**
             * The timeout that's used to throttle the resize events
             */
            _this.resizeThrottleId = INITIAL_VALUE;
            /**
             * The timeout that's used to debounce toggling the isCurrentlyBeingResized
             * variable after a resize
             */
            _this.resizeDebounceId = INITIAL_VALUE;
            _this.lastScrollPosition = _this.adapter.getViewportScrollY();
            _this.topAppBarHeight = _this.adapter.getTopAppBarHeight();
            return _this;
        }
        MDCTopAppBarFoundation.prototype.destroy = function () {
            _super.prototype.destroy.call(this);
            this.adapter.setStyle('top', '');
        };
        /**
         * Scroll handler for the default scroll behavior of the top app bar.
         * @override
         */
        MDCTopAppBarFoundation.prototype.handleTargetScroll = function () {
            var currentScrollPosition = Math.max(this.adapter.getViewportScrollY(), 0);
            var diff = currentScrollPosition - this.lastScrollPosition;
            this.lastScrollPosition = currentScrollPosition;
            // If the window is being resized the lastScrollPosition needs to be updated
            // but the current scroll of the top app bar should stay in the same
            // position.
            if (!this.isCurrentlyBeingResized) {
                this.currentAppBarOffsetTop -= diff;
                if (this.currentAppBarOffsetTop > 0) {
                    this.currentAppBarOffsetTop = 0;
                }
                else if (Math.abs(this.currentAppBarOffsetTop) > this.topAppBarHeight) {
                    this.currentAppBarOffsetTop = -this.topAppBarHeight;
                }
                this.moveTopAppBar();
            }
        };
        /**
         * Top app bar resize handler that throttle/debounce functions that execute updates.
         * @override
         */
        MDCTopAppBarFoundation.prototype.handleWindowResize = function () {
            var _this = this;
            // Throttle resize events 10 p/s
            if (!this.resizeThrottleId) {
                this.resizeThrottleId = setTimeout(function () {
                    _this.resizeThrottleId = INITIAL_VALUE;
                    _this.throttledResizeHandler();
                }, numbers$4.DEBOUNCE_THROTTLE_RESIZE_TIME_MS);
            }
            this.isCurrentlyBeingResized = true;
            if (this.resizeDebounceId) {
                clearTimeout(this.resizeDebounceId);
            }
            this.resizeDebounceId = setTimeout(function () {
                _this.handleTargetScroll();
                _this.isCurrentlyBeingResized = false;
                _this.resizeDebounceId = INITIAL_VALUE;
            }, numbers$4.DEBOUNCE_THROTTLE_RESIZE_TIME_MS);
        };
        /**
         * Function to determine if the DOM needs to update.
         */
        MDCTopAppBarFoundation.prototype.checkForUpdate = function () {
            var offscreenBoundaryTop = -this.topAppBarHeight;
            var hasAnyPixelsOffscreen = this.currentAppBarOffsetTop < 0;
            var hasAnyPixelsOnscreen = this.currentAppBarOffsetTop > offscreenBoundaryTop;
            var partiallyShowing = hasAnyPixelsOffscreen && hasAnyPixelsOnscreen;
            // If it's partially showing, it can't be docked.
            if (partiallyShowing) {
                this.wasDocked = false;
            }
            else {
                // Not previously docked and not partially showing, it's now docked.
                if (!this.wasDocked) {
                    this.wasDocked = true;
                    return true;
                }
                else if (this.isDockedShowing !== hasAnyPixelsOnscreen) {
                    this.isDockedShowing = hasAnyPixelsOnscreen;
                    return true;
                }
            }
            return partiallyShowing;
        };
        /**
         * Function to move the top app bar if needed.
         */
        MDCTopAppBarFoundation.prototype.moveTopAppBar = function () {
            if (this.checkForUpdate()) {
                // Once the top app bar is fully hidden we use the max potential top app bar height as our offset
                // so the top app bar doesn't show if the window resizes and the new height > the old height.
                var offset = this.currentAppBarOffsetTop;
                if (Math.abs(offset) >= this.topAppBarHeight) {
                    offset = -numbers$4.MAX_TOP_APP_BAR_HEIGHT;
                }
                this.adapter.setStyle('top', offset + 'px');
            }
        };
        /**
         * Throttled function that updates the top app bar scrolled values if the
         * top app bar height changes.
         */
        MDCTopAppBarFoundation.prototype.throttledResizeHandler = function () {
            var currentHeight = this.adapter.getTopAppBarHeight();
            if (this.topAppBarHeight !== currentHeight) {
                this.wasDocked = false;
                // Since the top app bar has a different height depending on the screen width, this
                // will ensure that the top app bar remains in the correct location if
                // completely hidden and a resize makes the top app bar a different height.
                this.currentAppBarOffsetTop -= this.topAppBarHeight - currentHeight;
                this.topAppBarHeight = currentHeight;
            }
            this.handleTargetScroll();
        };
        return MDCTopAppBarFoundation;
    }(MDCTopAppBarBaseFoundation));

    /**
     * @license
     * Copyright 2018 Google Inc.
     *
     * Permission is hereby granted, free of charge, to any person obtaining a copy
     * of this software and associated documentation files (the "Software"), to deal
     * in the Software without restriction, including without limitation the rights
     * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
     * copies of the Software, and to permit persons to whom the Software is
     * furnished to do so, subject to the following conditions:
     *
     * The above copyright notice and this permission notice shall be included in
     * all copies or substantial portions of the Software.
     *
     * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
     * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
     * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
     * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
     * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
     * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
     * THE SOFTWARE.
     */
    var MDCFixedTopAppBarFoundation = /** @class */ (function (_super) {
        __extends(MDCFixedTopAppBarFoundation, _super);
        function MDCFixedTopAppBarFoundation() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            /**
             * State variable for the previous scroll iteration top app bar state
             */
            _this.wasScrolled = false;
            return _this;
        }
        /**
         * Scroll handler for applying/removing the modifier class on the fixed top app bar.
         * @override
         */
        MDCFixedTopAppBarFoundation.prototype.handleTargetScroll = function () {
            var currentScroll = this.adapter.getViewportScrollY();
            if (currentScroll <= 0) {
                if (this.wasScrolled) {
                    this.adapter.removeClass(cssClasses$7.FIXED_SCROLLED_CLASS);
                    this.wasScrolled = false;
                }
            }
            else {
                if (!this.wasScrolled) {
                    this.adapter.addClass(cssClasses$7.FIXED_SCROLLED_CLASS);
                    this.wasScrolled = true;
                }
            }
        };
        return MDCFixedTopAppBarFoundation;
    }(MDCTopAppBarFoundation));

    /**
     * @license
     * Copyright 2018 Google Inc.
     *
     * Permission is hereby granted, free of charge, to any person obtaining a copy
     * of this software and associated documentation files (the "Software"), to deal
     * in the Software without restriction, including without limitation the rights
     * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
     * copies of the Software, and to permit persons to whom the Software is
     * furnished to do so, subject to the following conditions:
     *
     * The above copyright notice and this permission notice shall be included in
     * all copies or substantial portions of the Software.
     *
     * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
     * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
     * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
     * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
     * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
     * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
     * THE SOFTWARE.
     */
    var MDCShortTopAppBarFoundation = /** @class */ (function (_super) {
        __extends(MDCShortTopAppBarFoundation, _super);
        /* istanbul ignore next: optional argument is not a branch statement */
        function MDCShortTopAppBarFoundation(adapter) {
            var _this = _super.call(this, adapter) || this;
            _this.collapsed = false;
            _this.isAlwaysCollapsed = false;
            return _this;
        }
        Object.defineProperty(MDCShortTopAppBarFoundation.prototype, "isCollapsed", {
            // Public visibility for backward compatibility.
            get: function () {
                return this.collapsed;
            },
            enumerable: false,
            configurable: true
        });
        MDCShortTopAppBarFoundation.prototype.init = function () {
            _super.prototype.init.call(this);
            if (this.adapter.getTotalActionItems() > 0) {
                this.adapter.addClass(cssClasses$7.SHORT_HAS_ACTION_ITEM_CLASS);
            }
            // If initialized with SHORT_COLLAPSED_CLASS, the bar should always be collapsed
            this.setAlwaysCollapsed(this.adapter.hasClass(cssClasses$7.SHORT_COLLAPSED_CLASS));
        };
        /**
         * Set if the short top app bar should always be collapsed.
         *
         * @param value When `true`, bar will always be collapsed. When `false`, bar may collapse or expand based on scroll.
         */
        MDCShortTopAppBarFoundation.prototype.setAlwaysCollapsed = function (value) {
            this.isAlwaysCollapsed = !!value;
            if (this.isAlwaysCollapsed) {
                this.collapse();
            }
            else {
                // let maybeCollapseBar determine if the bar should be collapsed
                this.maybeCollapseBar();
            }
        };
        MDCShortTopAppBarFoundation.prototype.getAlwaysCollapsed = function () {
            return this.isAlwaysCollapsed;
        };
        /**
         * Scroll handler for applying/removing the collapsed modifier class on the short top app bar.
         * @override
         */
        MDCShortTopAppBarFoundation.prototype.handleTargetScroll = function () {
            this.maybeCollapseBar();
        };
        MDCShortTopAppBarFoundation.prototype.maybeCollapseBar = function () {
            if (this.isAlwaysCollapsed) {
                return;
            }
            var currentScroll = this.adapter.getViewportScrollY();
            if (currentScroll <= 0) {
                if (this.collapsed) {
                    this.uncollapse();
                }
            }
            else {
                if (!this.collapsed) {
                    this.collapse();
                }
            }
        };
        MDCShortTopAppBarFoundation.prototype.uncollapse = function () {
            this.adapter.removeClass(cssClasses$7.SHORT_COLLAPSED_CLASS);
            this.collapsed = false;
        };
        MDCShortTopAppBarFoundation.prototype.collapse = function () {
            this.adapter.addClass(cssClasses$7.SHORT_COLLAPSED_CLASS);
            this.collapsed = true;
        };
        return MDCShortTopAppBarFoundation;
    }(MDCTopAppBarBaseFoundation));

    function classMap(classObj) {
        return Object.entries(classObj)
            .filter(([name, value]) => name !== '' && value)
            .map(([name]) => name)
            .join(' ');
    }

    function dispatch(element, eventType, detail, eventInit = { bubbles: true }, 
    /** This is an internal thing used by SMUI to duplicate some SMUI events as MDC events. */
    duplicateEventForMDC = false) {
        if (typeof Event !== 'undefined' && element) {
            const event = new CustomEvent(eventType, Object.assign(Object.assign({}, eventInit), { detail }));
            element === null || element === void 0 ? void 0 : element.dispatchEvent(event);
            if (duplicateEventForMDC && eventType.startsWith('SMUI')) {
                const duplicateEvent = new CustomEvent(eventType.replace(/^SMUI/g, () => 'MDC'), Object.assign(Object.assign({}, eventInit), { detail }));
                element === null || element === void 0 ? void 0 : element.dispatchEvent(duplicateEvent);
                if (duplicateEvent.defaultPrevented) {
                    event.preventDefault();
                }
            }
            return event;
        }
    }

    function exclude(obj, keys) {
        let names = Object.getOwnPropertyNames(obj);
        const newObj = {};
        for (let i = 0; i < names.length; i++) {
            const name = names[i];
            const cashIndex = name.indexOf('$');
            if (cashIndex !== -1 &&
                keys.indexOf(name.substring(0, cashIndex + 1)) !== -1) {
                continue;
            }
            if (keys.indexOf(name) !== -1) {
                continue;
            }
            newObj[name] = obj[name];
        }
        return newObj;
    }

    // Match old modifiers. (only works on DOM events)
    const oldModifierRegex = /^[a-z]+(?::(?:preventDefault|stopPropagation|passive|nonpassive|capture|once|self))+$/;
    // Match new modifiers.
    const newModifierRegex = /^[^$]+(?:\$(?:preventDefault|stopPropagation|passive|nonpassive|capture|once|self))+$/;
    function forwardEventsBuilder(component) {
        // This is our pseudo $on function. It is defined on component mount.
        let $on;
        // This is a list of events bound before mount.
        let events = [];
        // And we override the $on function to forward all bound events.
        component.$on = (fullEventType, callback) => {
            let eventType = fullEventType;
            let destructor = () => { };
            if ($on) {
                // The event was bound programmatically.
                destructor = $on(eventType, callback);
            }
            else {
                // The event was bound before mount by Svelte.
                events.push([eventType, callback]);
            }
            const oldModifierMatch = eventType.match(oldModifierRegex);
            if (oldModifierMatch && console) {
                console.warn('Event modifiers in SMUI now use "$" instead of ":", so that ' +
                    'all events can be bound with modifiers. Please update your ' +
                    'event binding: ', eventType);
            }
            return () => {
                destructor();
            };
        };
        function forward(e) {
            // Internally bubble the event up from Svelte components.
            bubble(component, e);
        }
        return (node) => {
            const destructors = [];
            const forwardDestructors = {};
            // This function is responsible for listening and forwarding
            // all bound events.
            $on = (fullEventType, callback) => {
                let eventType = fullEventType;
                let handler = callback;
                // DOM addEventListener options argument.
                let options = false;
                const oldModifierMatch = eventType.match(oldModifierRegex);
                const newModifierMatch = eventType.match(newModifierRegex);
                const modifierMatch = oldModifierMatch || newModifierMatch;
                if (eventType.match(/^SMUI:\w+:/)) {
                    const newEventTypeParts = eventType.split(':');
                    let newEventType = '';
                    for (let i = 0; i < newEventTypeParts.length; i++) {
                        newEventType +=
                            i === newEventTypeParts.length - 1
                                ? ':' + newEventTypeParts[i]
                                : newEventTypeParts[i]
                                    .split('-')
                                    .map((value) => value.slice(0, 1).toUpperCase() + value.slice(1))
                                    .join('');
                    }
                    console.warn(`The event ${eventType.split('$')[0]} has been renamed to ${newEventType.split('$')[0]}.`);
                    eventType = newEventType;
                }
                if (modifierMatch) {
                    // Parse the event modifiers.
                    // Supported modifiers:
                    // - preventDefault
                    // - stopPropagation
                    // - passive
                    // - nonpassive
                    // - capture
                    // - once
                    const parts = eventType.split(oldModifierMatch ? ':' : '$');
                    eventType = parts[0];
                    const eventOptions = Object.fromEntries(parts.slice(1).map((mod) => [mod, true]));
                    if (eventOptions.passive) {
                        options = options || {};
                        options.passive = true;
                    }
                    if (eventOptions.nonpassive) {
                        options = options || {};
                        options.passive = false;
                    }
                    if (eventOptions.capture) {
                        options = options || {};
                        options.capture = true;
                    }
                    if (eventOptions.once) {
                        options = options || {};
                        options.once = true;
                    }
                    if (eventOptions.preventDefault) {
                        handler = prevent_default(handler);
                    }
                    if (eventOptions.stopPropagation) {
                        handler = stop_propagation(handler);
                    }
                }
                // Listen for the event directly, with the given options.
                const off = listen(node, eventType, handler, options);
                const destructor = () => {
                    off();
                    const idx = destructors.indexOf(destructor);
                    if (idx > -1) {
                        destructors.splice(idx, 1);
                    }
                };
                destructors.push(destructor);
                // Forward the event from Svelte.
                if (!(eventType in forwardDestructors)) {
                    forwardDestructors[eventType] = listen(node, eventType, forward);
                }
                return destructor;
            };
            for (let i = 0; i < events.length; i++) {
                // Listen to all the events added before mount.
                $on(events[i][0], events[i][1]);
            }
            return {
                destroy: () => {
                    // Remove all event listeners.
                    for (let i = 0; i < destructors.length; i++) {
                        destructors[i]();
                    }
                    // Remove all event forwarders.
                    for (let entry of Object.entries(forwardDestructors)) {
                        entry[1]();
                    }
                },
            };
        };
    }

    function prefixFilter(obj, prefix) {
        let names = Object.getOwnPropertyNames(obj);
        const newObj = {};
        for (let i = 0; i < names.length; i++) {
            const name = names[i];
            if (name.substring(0, prefix.length) === prefix) {
                newObj[name.substring(prefix.length)] = obj[name];
            }
        }
        return newObj;
    }

    function useActions(node, actions) {
        let actionReturns = [];
        if (actions) {
            for (let i = 0; i < actions.length; i++) {
                const actionEntry = actions[i];
                const action = Array.isArray(actionEntry) ? actionEntry[0] : actionEntry;
                if (Array.isArray(actionEntry) && actionEntry.length > 1) {
                    actionReturns.push(action(node, actionEntry[1]));
                }
                else {
                    actionReturns.push(action(node));
                }
            }
        }
        return {
            update(actions) {
                if (((actions && actions.length) || 0) != actionReturns.length) {
                    throw new Error('You must not change the length of an actions array.');
                }
                if (actions) {
                    for (let i = 0; i < actions.length; i++) {
                        const returnEntry = actionReturns[i];
                        if (returnEntry && returnEntry.update) {
                            const actionEntry = actions[i];
                            if (Array.isArray(actionEntry) && actionEntry.length > 1) {
                                returnEntry.update(actionEntry[1]);
                            }
                            else {
                                returnEntry.update();
                            }
                        }
                    }
                }
            },
            destroy() {
                for (let i = 0; i < actionReturns.length; i++) {
                    const returnEntry = actionReturns[i];
                    if (returnEntry && returnEntry.destroy) {
                        returnEntry.destroy();
                    }
                }
            },
        };
    }

    /* node_modules\@smui\top-app-bar\dist\TopAppBar.svelte generated by Svelte v3.46.4 */

    const { window: window_1 } = globals;

    const file$m = "node_modules\\@smui\\top-app-bar\\dist\\TopAppBar.svelte";

    function create_fragment$r(ctx) {
    	let header;
    	let header_class_value;
    	let header_style_value;
    	let useActions_action;
    	let current;
    	let mounted;
    	let dispose;
    	const default_slot_template = /*#slots*/ ctx[22].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[21], null);

    	let header_levels = [
    		{
    			class: header_class_value = classMap({
    				[/*className*/ ctx[2]]: true,
    				'mdc-top-app-bar': true,
    				'mdc-top-app-bar--short': /*variant*/ ctx[4] === 'short',
    				'mdc-top-app-bar--short-collapsed': /*collapsed*/ ctx[0],
    				'mdc-top-app-bar--fixed': /*variant*/ ctx[4] === 'fixed',
    				'smui-top-app-bar--static': /*variant*/ ctx[4] === 'static',
    				'smui-top-app-bar--color-secondary': /*color*/ ctx[5] === 'secondary',
    				'mdc-top-app-bar--prominent': /*prominent*/ ctx[6],
    				'mdc-top-app-bar--dense': /*dense*/ ctx[7],
    				.../*internalClasses*/ ctx[11]
    			})
    		},
    		{
    			style: header_style_value = Object.entries(/*internalStyles*/ ctx[12]).map(func$6).concat([/*style*/ ctx[3]]).join(' ')
    		},
    		/*$$restProps*/ ctx[15]
    	];

    	let header_data = {};

    	for (let i = 0; i < header_levels.length; i += 1) {
    		header_data = assign(header_data, header_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			header = element("header");
    			if (default_slot) default_slot.c();
    			set_attributes(header, header_data);
    			add_location(header, file$m, 9, 0, 208);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, header, anchor);

    			if (default_slot) {
    				default_slot.m(header, null);
    			}

    			/*header_binding*/ ctx[25](header);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(window_1, "resize", /*resize_handler*/ ctx[23], false, false, false),
    					listen_dev(window_1, "scroll", /*scroll_handler*/ ctx[24], false, false, false),
    					action_destroyer(useActions_action = useActions.call(null, header, /*use*/ ctx[1])),
    					action_destroyer(/*forwardEvents*/ ctx[13].call(null, header)),
    					listen_dev(header, "SMUITopAppBarIconButton:nav", /*SMUITopAppBarIconButton_nav_handler*/ ctx[26], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty[0] & /*$$scope*/ 2097152)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[21],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[21])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[21], dirty, null),
    						null
    					);
    				}
    			}

    			set_attributes(header, header_data = get_spread_update(header_levels, [
    				(!current || dirty[0] & /*className, variant, collapsed, color, prominent, dense, internalClasses*/ 2293 && header_class_value !== (header_class_value = classMap({
    					[/*className*/ ctx[2]]: true,
    					'mdc-top-app-bar': true,
    					'mdc-top-app-bar--short': /*variant*/ ctx[4] === 'short',
    					'mdc-top-app-bar--short-collapsed': /*collapsed*/ ctx[0],
    					'mdc-top-app-bar--fixed': /*variant*/ ctx[4] === 'fixed',
    					'smui-top-app-bar--static': /*variant*/ ctx[4] === 'static',
    					'smui-top-app-bar--color-secondary': /*color*/ ctx[5] === 'secondary',
    					'mdc-top-app-bar--prominent': /*prominent*/ ctx[6],
    					'mdc-top-app-bar--dense': /*dense*/ ctx[7],
    					.../*internalClasses*/ ctx[11]
    				}))) && { class: header_class_value },
    				(!current || dirty[0] & /*internalStyles, style*/ 4104 && header_style_value !== (header_style_value = Object.entries(/*internalStyles*/ ctx[12]).map(func$6).concat([/*style*/ ctx[3]]).join(' '))) && { style: header_style_value },
    				dirty[0] & /*$$restProps*/ 32768 && /*$$restProps*/ ctx[15]
    			]));

    			if (useActions_action && is_function(useActions_action.update) && dirty[0] & /*use*/ 2) useActions_action.update.call(null, /*use*/ ctx[1]);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(header);
    			if (default_slot) default_slot.d(detaching);
    			/*header_binding*/ ctx[25](null);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$r.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    const func$6 = ([name, value]) => `${name}: ${value};`;

    function instance_1$7($$self, $$props, $$invalidate) {
    	const omit_props_names = [
    		"use","class","style","variant","color","collapsed","prominent","dense","scrollTarget","getPropStore","getElement"
    	];

    	let $$restProps = compute_rest_props($$props, omit_props_names);
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('TopAppBar', slots, ['default']);
    	const forwardEvents = forwardEventsBuilder(get_current_component());

    	let uninitializedValue = () => {
    		
    	};

    	function isUninitializedValue(value) {
    		return value === uninitializedValue;
    	}

    	let { use = [] } = $$props;
    	let { class: className = '' } = $$props;
    	let { style = '' } = $$props;
    	let { variant = 'standard' } = $$props;
    	let { color = 'primary' } = $$props;
    	let { collapsed = uninitializedValue } = $$props;
    	const alwaysCollapsed = !isUninitializedValue(collapsed) && !!collapsed;

    	if (isUninitializedValue(collapsed)) {
    		collapsed = false;
    	}

    	let { prominent = false } = $$props;
    	let { dense = false } = $$props;
    	let { scrollTarget = undefined } = $$props;
    	let element;
    	let instance;
    	let internalClasses = {};
    	let internalStyles = {};
    	let propStoreSet;

    	let propStore = readable({ variant, prominent, dense }, set => {
    		$$invalidate(18, propStoreSet = set);
    	});

    	let oldScrollTarget = undefined;
    	let oldVariant = variant;

    	onMount(() => {
    		$$invalidate(9, instance = getInstance());
    		instance.init();

    		return () => {
    			instance.destroy();
    		};
    	});

    	function getInstance() {
    		const Foundation = ({
    			static: MDCTopAppBarBaseFoundation,
    			short: MDCShortTopAppBarFoundation,
    			fixed: MDCFixedTopAppBarFoundation
    		})[variant] || MDCTopAppBarFoundation;

    		return new Foundation({
    				hasClass,
    				addClass,
    				removeClass,
    				setStyle: addStyle,
    				getTopAppBarHeight: () => element.clientHeight,
    				notifyNavigationIconClicked: () => dispatch(element, 'SMUITopAppBar:nav', undefined, undefined, true),
    				getViewportScrollY: () => scrollTarget == null
    				? window.pageYOffset
    				: scrollTarget.scrollTop,
    				getTotalActionItems: () => element.querySelectorAll('.mdc-top-app-bar__action-item').length
    			});
    	}

    	function hasClass(className) {
    		return className in internalClasses
    		? internalClasses[className]
    		: getElement().classList.contains(className);
    	}

    	function addClass(className) {
    		if (!internalClasses[className]) {
    			$$invalidate(11, internalClasses[className] = true, internalClasses);
    		}
    	}

    	function removeClass(className) {
    		if (!(className in internalClasses) || internalClasses[className]) {
    			$$invalidate(11, internalClasses[className] = false, internalClasses);
    		}
    	}

    	function addStyle(name, value) {
    		if (internalStyles[name] != value) {
    			if (value === '' || value == null) {
    				delete internalStyles[name];
    				((($$invalidate(12, internalStyles), $$invalidate(20, oldVariant)), $$invalidate(4, variant)), $$invalidate(9, instance));
    			} else {
    				$$invalidate(12, internalStyles[name] = value, internalStyles);
    			}
    		}
    	}

    	function handleTargetScroll() {
    		if (instance) {
    			instance.handleTargetScroll();

    			if (variant === 'short') {
    				$$invalidate(0, collapsed = 'isCollapsed' in instance && instance.isCollapsed);
    			}
    		}
    	}

    	function getPropStore() {
    		return propStore;
    	}

    	function getElement() {
    		return element;
    	}

    	const resize_handler = () => variant !== 'short' && variant !== 'fixed' && instance && instance.handleWindowResize();
    	const scroll_handler = () => scrollTarget == null && handleTargetScroll();

    	function header_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			element = $$value;
    			$$invalidate(10, element);
    		});
    	}

    	const SMUITopAppBarIconButton_nav_handler = () => instance && instance.handleNavigationClick();

    	$$self.$$set = $$new_props => {
    		$$props = assign(assign({}, $$props), exclude_internal_props($$new_props));
    		$$invalidate(15, $$restProps = compute_rest_props($$props, omit_props_names));
    		if ('use' in $$new_props) $$invalidate(1, use = $$new_props.use);
    		if ('class' in $$new_props) $$invalidate(2, className = $$new_props.class);
    		if ('style' in $$new_props) $$invalidate(3, style = $$new_props.style);
    		if ('variant' in $$new_props) $$invalidate(4, variant = $$new_props.variant);
    		if ('color' in $$new_props) $$invalidate(5, color = $$new_props.color);
    		if ('collapsed' in $$new_props) $$invalidate(0, collapsed = $$new_props.collapsed);
    		if ('prominent' in $$new_props) $$invalidate(6, prominent = $$new_props.prominent);
    		if ('dense' in $$new_props) $$invalidate(7, dense = $$new_props.dense);
    		if ('scrollTarget' in $$new_props) $$invalidate(8, scrollTarget = $$new_props.scrollTarget);
    		if ('$$scope' in $$new_props) $$invalidate(21, $$scope = $$new_props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		MDCTopAppBarBaseFoundation,
    		MDCTopAppBarFoundation,
    		MDCFixedTopAppBarFoundation,
    		MDCShortTopAppBarFoundation,
    		onMount,
    		get_current_component,
    		readable,
    		forwardEventsBuilder,
    		classMap,
    		useActions,
    		dispatch,
    		forwardEvents,
    		uninitializedValue,
    		isUninitializedValue,
    		use,
    		className,
    		style,
    		variant,
    		color,
    		collapsed,
    		alwaysCollapsed,
    		prominent,
    		dense,
    		scrollTarget,
    		element,
    		instance,
    		internalClasses,
    		internalStyles,
    		propStoreSet,
    		propStore,
    		oldScrollTarget,
    		oldVariant,
    		getInstance,
    		hasClass,
    		addClass,
    		removeClass,
    		addStyle,
    		handleTargetScroll,
    		getPropStore,
    		getElement
    	});

    	$$self.$inject_state = $$new_props => {
    		if ('uninitializedValue' in $$props) uninitializedValue = $$new_props.uninitializedValue;
    		if ('use' in $$props) $$invalidate(1, use = $$new_props.use);
    		if ('className' in $$props) $$invalidate(2, className = $$new_props.className);
    		if ('style' in $$props) $$invalidate(3, style = $$new_props.style);
    		if ('variant' in $$props) $$invalidate(4, variant = $$new_props.variant);
    		if ('color' in $$props) $$invalidate(5, color = $$new_props.color);
    		if ('collapsed' in $$props) $$invalidate(0, collapsed = $$new_props.collapsed);
    		if ('prominent' in $$props) $$invalidate(6, prominent = $$new_props.prominent);
    		if ('dense' in $$props) $$invalidate(7, dense = $$new_props.dense);
    		if ('scrollTarget' in $$props) $$invalidate(8, scrollTarget = $$new_props.scrollTarget);
    		if ('element' in $$props) $$invalidate(10, element = $$new_props.element);
    		if ('instance' in $$props) $$invalidate(9, instance = $$new_props.instance);
    		if ('internalClasses' in $$props) $$invalidate(11, internalClasses = $$new_props.internalClasses);
    		if ('internalStyles' in $$props) $$invalidate(12, internalStyles = $$new_props.internalStyles);
    		if ('propStoreSet' in $$props) $$invalidate(18, propStoreSet = $$new_props.propStoreSet);
    		if ('propStore' in $$props) propStore = $$new_props.propStore;
    		if ('oldScrollTarget' in $$props) $$invalidate(19, oldScrollTarget = $$new_props.oldScrollTarget);
    		if ('oldVariant' in $$props) $$invalidate(20, oldVariant = $$new_props.oldVariant);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty[0] & /*propStoreSet, variant, prominent, dense*/ 262352) {
    			if (propStoreSet) {
    				propStoreSet({ variant, prominent, dense });
    			}
    		}

    		if ($$self.$$.dirty[0] & /*oldVariant, variant, instance*/ 1049104) {
    			if (oldVariant !== variant && instance) {
    				$$invalidate(20, oldVariant = variant);
    				instance.destroy();
    				$$invalidate(11, internalClasses = {});
    				$$invalidate(12, internalStyles = {});
    				$$invalidate(9, instance = getInstance());
    				instance.init();
    			}
    		}

    		if ($$self.$$.dirty[0] & /*instance, variant*/ 528) {
    			if (instance && variant === 'short' && 'setAlwaysCollapsed' in instance) {
    				instance.setAlwaysCollapsed(alwaysCollapsed);
    			}
    		}

    		if ($$self.$$.dirty[0] & /*oldScrollTarget, scrollTarget*/ 524544) {
    			if (oldScrollTarget !== scrollTarget) {
    				if (oldScrollTarget) {
    					oldScrollTarget.removeEventListener('scroll', handleTargetScroll);
    				}

    				if (scrollTarget) {
    					scrollTarget.addEventListener('scroll', handleTargetScroll);
    				}

    				$$invalidate(19, oldScrollTarget = scrollTarget);
    			}
    		}
    	};

    	return [
    		collapsed,
    		use,
    		className,
    		style,
    		variant,
    		color,
    		prominent,
    		dense,
    		scrollTarget,
    		instance,
    		element,
    		internalClasses,
    		internalStyles,
    		forwardEvents,
    		handleTargetScroll,
    		$$restProps,
    		getPropStore,
    		getElement,
    		propStoreSet,
    		oldScrollTarget,
    		oldVariant,
    		$$scope,
    		slots,
    		resize_handler,
    		scroll_handler,
    		header_binding,
    		SMUITopAppBarIconButton_nav_handler
    	];
    }

    class TopAppBar extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(
    			this,
    			options,
    			instance_1$7,
    			create_fragment$r,
    			safe_not_equal,
    			{
    				use: 1,
    				class: 2,
    				style: 3,
    				variant: 4,
    				color: 5,
    				collapsed: 0,
    				prominent: 6,
    				dense: 7,
    				scrollTarget: 8,
    				getPropStore: 16,
    				getElement: 17
    			},
    			null,
    			[-1, -1]
    		);

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "TopAppBar",
    			options,
    			id: create_fragment$r.name
    		});
    	}

    	get use() {
    		throw new Error("<TopAppBar>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set use(value) {
    		throw new Error("<TopAppBar>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get class() {
    		throw new Error("<TopAppBar>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set class(value) {
    		throw new Error("<TopAppBar>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get style() {
    		throw new Error("<TopAppBar>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set style(value) {
    		throw new Error("<TopAppBar>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get variant() {
    		throw new Error("<TopAppBar>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set variant(value) {
    		throw new Error("<TopAppBar>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get color() {
    		throw new Error("<TopAppBar>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set color(value) {
    		throw new Error("<TopAppBar>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get collapsed() {
    		throw new Error("<TopAppBar>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set collapsed(value) {
    		throw new Error("<TopAppBar>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get prominent() {
    		throw new Error("<TopAppBar>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set prominent(value) {
    		throw new Error("<TopAppBar>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get dense() {
    		throw new Error("<TopAppBar>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set dense(value) {
    		throw new Error("<TopAppBar>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get scrollTarget() {
    		throw new Error("<TopAppBar>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set scrollTarget(value) {
    		throw new Error("<TopAppBar>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get getPropStore() {
    		return this.$$.ctx[16];
    	}

    	set getPropStore(value) {
    		throw new Error("<TopAppBar>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get getElement() {
    		return this.$$.ctx[17];
    	}

    	set getElement(value) {
    		throw new Error("<TopAppBar>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules\@smui\common\dist\elements\Div.svelte generated by Svelte v3.46.4 */
    const file$l = "node_modules\\@smui\\common\\dist\\elements\\Div.svelte";

    function create_fragment$q(ctx) {
    	let div;
    	let useActions_action;
    	let current;
    	let mounted;
    	let dispose;
    	const default_slot_template = /*#slots*/ ctx[6].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[5], null);
    	let div_levels = [/*$$restProps*/ ctx[3]];
    	let div_data = {};

    	for (let i = 0; i < div_levels.length; i += 1) {
    		div_data = assign(div_data, div_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (default_slot) default_slot.c();
    			set_attributes(div, div_data);
    			add_location(div, file$l, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (default_slot) {
    				default_slot.m(div, null);
    			}

    			/*div_binding*/ ctx[7](div);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					action_destroyer(useActions_action = useActions.call(null, div, /*use*/ ctx[0])),
    					action_destroyer(/*forwardEvents*/ ctx[2].call(null, div))
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 32)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[5],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[5])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[5], dirty, null),
    						null
    					);
    				}
    			}

    			set_attributes(div, div_data = get_spread_update(div_levels, [dirty & /*$$restProps*/ 8 && /*$$restProps*/ ctx[3]]));
    			if (useActions_action && is_function(useActions_action.update) && dirty & /*use*/ 1) useActions_action.update.call(null, /*use*/ ctx[0]);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (default_slot) default_slot.d(detaching);
    			/*div_binding*/ ctx[7](null);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$q.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$j($$self, $$props, $$invalidate) {
    	const omit_props_names = ["use","getElement"];
    	let $$restProps = compute_rest_props($$props, omit_props_names);
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Div', slots, ['default']);
    	let { use = [] } = $$props;
    	const forwardEvents = forwardEventsBuilder(get_current_component());
    	let element;

    	function getElement() {
    		return element;
    	}

    	function div_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			element = $$value;
    			$$invalidate(1, element);
    		});
    	}

    	$$self.$$set = $$new_props => {
    		$$props = assign(assign({}, $$props), exclude_internal_props($$new_props));
    		$$invalidate(3, $$restProps = compute_rest_props($$props, omit_props_names));
    		if ('use' in $$new_props) $$invalidate(0, use = $$new_props.use);
    		if ('$$scope' in $$new_props) $$invalidate(5, $$scope = $$new_props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		get_current_component,
    		forwardEventsBuilder,
    		useActions,
    		use,
    		forwardEvents,
    		element,
    		getElement
    	});

    	$$self.$inject_state = $$new_props => {
    		if ('use' in $$props) $$invalidate(0, use = $$new_props.use);
    		if ('element' in $$props) $$invalidate(1, element = $$new_props.element);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		use,
    		element,
    		forwardEvents,
    		$$restProps,
    		getElement,
    		$$scope,
    		slots,
    		div_binding
    	];
    }

    class Div$1 extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$j, create_fragment$q, safe_not_equal, { use: 0, getElement: 4 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Div",
    			options,
    			id: create_fragment$q.name
    		});
    	}

    	get use() {
    		throw new Error("<Div>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set use(value) {
    		throw new Error("<Div>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get getElement() {
    		return this.$$.ctx[4];
    	}

    	set getElement(value) {
    		throw new Error("<Div>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules\@smui\common\dist\classadder\ClassAdder.svelte generated by Svelte v3.46.4 */

    // (1:0) <svelte:component   this={component}   bind:this={element}   use={[forwardEvents, ...use]}   class={classMap({     [className]: true,     [smuiClass]: true,     ...smuiClassMap,   })}   {...props}   {...$$restProps}>
    function create_default_slot$a(ctx) {
    	let current;
    	const default_slot_template = /*#slots*/ ctx[10].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[12], null);

    	const block = {
    		c: function create() {
    			if (default_slot) default_slot.c();
    		},
    		m: function mount(target, anchor) {
    			if (default_slot) {
    				default_slot.m(target, anchor);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 4096)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[12],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[12])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[12], dirty, null),
    						null
    					);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$a.name,
    		type: "slot",
    		source: "(1:0) <svelte:component   this={component}   bind:this={element}   use={[forwardEvents, ...use]}   class={classMap({     [className]: true,     [smuiClass]: true,     ...smuiClassMap,   })}   {...props}   {...$$restProps}>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$p(ctx) {
    	let switch_instance;
    	let switch_instance_anchor;
    	let current;

    	const switch_instance_spread_levels = [
    		{
    			use: [/*forwardEvents*/ ctx[7], .../*use*/ ctx[0]]
    		},
    		{
    			class: classMap({
    				[/*className*/ ctx[1]]: true,
    				[/*smuiClass*/ ctx[5]]: true,
    				.../*smuiClassMap*/ ctx[4]
    			})
    		},
    		/*props*/ ctx[6],
    		/*$$restProps*/ ctx[8]
    	];

    	var switch_value = /*component*/ ctx[2];

    	function switch_props(ctx) {
    		let switch_instance_props = {
    			$$slots: { default: [create_default_slot$a] },
    			$$scope: { ctx }
    		};

    		for (let i = 0; i < switch_instance_spread_levels.length; i += 1) {
    			switch_instance_props = assign(switch_instance_props, switch_instance_spread_levels[i]);
    		}

    		return {
    			props: switch_instance_props,
    			$$inline: true
    		};
    	}

    	if (switch_value) {
    		switch_instance = new switch_value(switch_props(ctx));
    		/*switch_instance_binding*/ ctx[11](switch_instance);
    	}

    	const block = {
    		c: function create() {
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			switch_instance_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (switch_instance) {
    				mount_component(switch_instance, target, anchor);
    			}

    			insert_dev(target, switch_instance_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const switch_instance_changes = (dirty & /*forwardEvents, use, classMap, className, smuiClass, smuiClassMap, props, $$restProps*/ 499)
    			? get_spread_update(switch_instance_spread_levels, [
    					dirty & /*forwardEvents, use*/ 129 && {
    						use: [/*forwardEvents*/ ctx[7], .../*use*/ ctx[0]]
    					},
    					dirty & /*classMap, className, smuiClass, smuiClassMap*/ 50 && {
    						class: classMap({
    							[/*className*/ ctx[1]]: true,
    							[/*smuiClass*/ ctx[5]]: true,
    							.../*smuiClassMap*/ ctx[4]
    						})
    					},
    					dirty & /*props*/ 64 && get_spread_object(/*props*/ ctx[6]),
    					dirty & /*$$restProps*/ 256 && get_spread_object(/*$$restProps*/ ctx[8])
    				])
    			: {};

    			if (dirty & /*$$scope*/ 4096) {
    				switch_instance_changes.$$scope = { dirty, ctx };
    			}

    			if (switch_value !== (switch_value = /*component*/ ctx[2])) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;

    					transition_out(old_component.$$.fragment, 1, 0, () => {
    						destroy_component(old_component, 1);
    					});

    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = new switch_value(switch_props(ctx));
    					/*switch_instance_binding*/ ctx[11](switch_instance);
    					create_component(switch_instance.$$.fragment);
    					transition_in(switch_instance.$$.fragment, 1);
    					mount_component(switch_instance, switch_instance_anchor.parentNode, switch_instance_anchor);
    				} else {
    					switch_instance = null;
    				}
    			} else if (switch_value) {
    				switch_instance.$set(switch_instance_changes);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			/*switch_instance_binding*/ ctx[11](null);
    			if (detaching) detach_dev(switch_instance_anchor);
    			if (switch_instance) destroy_component(switch_instance, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$p.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    const internals = {
    	component: Div$1,
    	class: '',
    	classMap: {},
    	contexts: {},
    	props: {}
    };

    function instance$i($$self, $$props, $$invalidate) {
    	const omit_props_names = ["use","class","component","getElement"];
    	let $$restProps = compute_rest_props($$props, omit_props_names);
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('ClassAdder', slots, ['default']);
    	let { use = [] } = $$props;
    	let { class: className = '' } = $$props;
    	let element;
    	const smuiClass = internals.class;
    	const smuiClassMap = {};
    	const smuiClassUnsubscribes = [];
    	const contexts = internals.contexts;
    	const props = internals.props;
    	let { component = internals.component } = $$props;

    	Object.entries(internals.classMap).forEach(([name, context]) => {
    		const store = getContext(context);

    		if (store && 'subscribe' in store) {
    			smuiClassUnsubscribes.push(store.subscribe(value => {
    				$$invalidate(4, smuiClassMap[name] = value, smuiClassMap);
    			}));
    		}
    	});

    	const forwardEvents = forwardEventsBuilder(get_current_component());

    	for (let context in contexts) {
    		if (contexts.hasOwnProperty(context)) {
    			setContext(context, contexts[context]);
    		}
    	}

    	onDestroy(() => {
    		for (const unsubscribe of smuiClassUnsubscribes) {
    			unsubscribe();
    		}
    	});

    	function getElement() {
    		return element.getElement();
    	}

    	function switch_instance_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			element = $$value;
    			$$invalidate(3, element);
    		});
    	}

    	$$self.$$set = $$new_props => {
    		$$props = assign(assign({}, $$props), exclude_internal_props($$new_props));
    		$$invalidate(8, $$restProps = compute_rest_props($$props, omit_props_names));
    		if ('use' in $$new_props) $$invalidate(0, use = $$new_props.use);
    		if ('class' in $$new_props) $$invalidate(1, className = $$new_props.class);
    		if ('component' in $$new_props) $$invalidate(2, component = $$new_props.component);
    		if ('$$scope' in $$new_props) $$invalidate(12, $$scope = $$new_props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		Div: Div$1,
    		internals,
    		onDestroy,
    		getContext,
    		setContext,
    		get_current_component,
    		forwardEventsBuilder,
    		classMap,
    		use,
    		className,
    		element,
    		smuiClass,
    		smuiClassMap,
    		smuiClassUnsubscribes,
    		contexts,
    		props,
    		component,
    		forwardEvents,
    		getElement
    	});

    	$$self.$inject_state = $$new_props => {
    		if ('use' in $$props) $$invalidate(0, use = $$new_props.use);
    		if ('className' in $$props) $$invalidate(1, className = $$new_props.className);
    		if ('element' in $$props) $$invalidate(3, element = $$new_props.element);
    		if ('component' in $$props) $$invalidate(2, component = $$new_props.component);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		use,
    		className,
    		component,
    		element,
    		smuiClassMap,
    		smuiClass,
    		props,
    		forwardEvents,
    		$$restProps,
    		getElement,
    		slots,
    		switch_instance_binding,
    		$$scope
    	];
    }

    class ClassAdder extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$i, create_fragment$p, safe_not_equal, {
    			use: 0,
    			class: 1,
    			component: 2,
    			getElement: 9
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ClassAdder",
    			options,
    			id: create_fragment$p.name
    		});
    	}

    	get use() {
    		throw new Error("<ClassAdder>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set use(value) {
    		throw new Error("<ClassAdder>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get class() {
    		throw new Error("<ClassAdder>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set class(value) {
    		throw new Error("<ClassAdder>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get component() {
    		throw new Error("<ClassAdder>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set component(value) {
    		throw new Error("<ClassAdder>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get getElement() {
    		return this.$$.ctx[9];
    	}

    	set getElement(value) {
    		throw new Error("<ClassAdder>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    // @ts-ignore: Internals is exported... argh.
    const defaults = Object.assign({}, internals);
    function classAdderBuilder(props) {
        return new Proxy(ClassAdder, {
            construct: function (target, args) {
                Object.assign(internals, defaults, props);
                // @ts-ignore: Need spread arg.
                return new target(...args);
            },
            get: function (target, prop) {
                Object.assign(internals, defaults, props);
                return target[prop];
            },
        });
    }

    /* node_modules\@smui\common\dist\elements\A.svelte generated by Svelte v3.46.4 */
    const file$k = "node_modules\\@smui\\common\\dist\\elements\\A.svelte";

    function create_fragment$o(ctx) {
    	let a;
    	let useActions_action;
    	let current;
    	let mounted;
    	let dispose;
    	const default_slot_template = /*#slots*/ ctx[7].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[6], null);
    	let a_levels = [{ href: /*href*/ ctx[1] }, /*$$restProps*/ ctx[4]];
    	let a_data = {};

    	for (let i = 0; i < a_levels.length; i += 1) {
    		a_data = assign(a_data, a_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			a = element("a");
    			if (default_slot) default_slot.c();
    			set_attributes(a, a_data);
    			add_location(a, file$k, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);

    			if (default_slot) {
    				default_slot.m(a, null);
    			}

    			/*a_binding*/ ctx[8](a);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					action_destroyer(useActions_action = useActions.call(null, a, /*use*/ ctx[0])),
    					action_destroyer(/*forwardEvents*/ ctx[3].call(null, a))
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 64)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[6],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[6])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[6], dirty, null),
    						null
    					);
    				}
    			}

    			set_attributes(a, a_data = get_spread_update(a_levels, [
    				(!current || dirty & /*href*/ 2) && { href: /*href*/ ctx[1] },
    				dirty & /*$$restProps*/ 16 && /*$$restProps*/ ctx[4]
    			]));

    			if (useActions_action && is_function(useActions_action.update) && dirty & /*use*/ 1) useActions_action.update.call(null, /*use*/ ctx[0]);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(a);
    			if (default_slot) default_slot.d(detaching);
    			/*a_binding*/ ctx[8](null);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$o.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$h($$self, $$props, $$invalidate) {
    	const omit_props_names = ["use","href","getElement"];
    	let $$restProps = compute_rest_props($$props, omit_props_names);
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('A', slots, ['default']);
    	let { use = [] } = $$props;
    	let { href = 'javascript:void(0);' } = $$props;
    	const forwardEvents = forwardEventsBuilder(get_current_component());
    	let element;

    	function getElement() {
    		return element;
    	}

    	function a_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			element = $$value;
    			$$invalidate(2, element);
    		});
    	}

    	$$self.$$set = $$new_props => {
    		$$props = assign(assign({}, $$props), exclude_internal_props($$new_props));
    		$$invalidate(4, $$restProps = compute_rest_props($$props, omit_props_names));
    		if ('use' in $$new_props) $$invalidate(0, use = $$new_props.use);
    		if ('href' in $$new_props) $$invalidate(1, href = $$new_props.href);
    		if ('$$scope' in $$new_props) $$invalidate(6, $$scope = $$new_props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		get_current_component,
    		forwardEventsBuilder,
    		useActions,
    		use,
    		href,
    		forwardEvents,
    		element,
    		getElement
    	});

    	$$self.$inject_state = $$new_props => {
    		if ('use' in $$props) $$invalidate(0, use = $$new_props.use);
    		if ('href' in $$props) $$invalidate(1, href = $$new_props.href);
    		if ('element' in $$props) $$invalidate(2, element = $$new_props.element);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		use,
    		href,
    		element,
    		forwardEvents,
    		$$restProps,
    		getElement,
    		$$scope,
    		slots,
    		a_binding
    	];
    }

    class A$1 extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$h, create_fragment$o, safe_not_equal, { use: 0, href: 1, getElement: 5 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "A",
    			options,
    			id: create_fragment$o.name
    		});
    	}

    	get use() {
    		throw new Error("<A>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set use(value) {
    		throw new Error("<A>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get href() {
    		throw new Error("<A>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set href(value) {
    		throw new Error("<A>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get getElement() {
    		return this.$$.ctx[5];
    	}

    	set getElement(value) {
    		throw new Error("<A>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules\@smui\common\dist\elements\Button.svelte generated by Svelte v3.46.4 */
    const file$j = "node_modules\\@smui\\common\\dist\\elements\\Button.svelte";

    function create_fragment$n(ctx) {
    	let button;
    	let useActions_action;
    	let current;
    	let mounted;
    	let dispose;
    	const default_slot_template = /*#slots*/ ctx[6].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[5], null);
    	let button_levels = [/*$$restProps*/ ctx[3]];
    	let button_data = {};

    	for (let i = 0; i < button_levels.length; i += 1) {
    		button_data = assign(button_data, button_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			button = element("button");
    			if (default_slot) default_slot.c();
    			set_attributes(button, button_data);
    			add_location(button, file$j, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);

    			if (default_slot) {
    				default_slot.m(button, null);
    			}

    			if (button.autofocus) button.focus();
    			/*button_binding*/ ctx[7](button);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					action_destroyer(useActions_action = useActions.call(null, button, /*use*/ ctx[0])),
    					action_destroyer(/*forwardEvents*/ ctx[2].call(null, button))
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 32)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[5],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[5])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[5], dirty, null),
    						null
    					);
    				}
    			}

    			set_attributes(button, button_data = get_spread_update(button_levels, [dirty & /*$$restProps*/ 8 && /*$$restProps*/ ctx[3]]));
    			if (useActions_action && is_function(useActions_action.update) && dirty & /*use*/ 1) useActions_action.update.call(null, /*use*/ ctx[0]);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			if (default_slot) default_slot.d(detaching);
    			/*button_binding*/ ctx[7](null);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$n.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$g($$self, $$props, $$invalidate) {
    	const omit_props_names = ["use","getElement"];
    	let $$restProps = compute_rest_props($$props, omit_props_names);
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Button', slots, ['default']);
    	let { use = [] } = $$props;
    	const forwardEvents = forwardEventsBuilder(get_current_component());
    	let element;

    	function getElement() {
    		return element;
    	}

    	function button_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			element = $$value;
    			$$invalidate(1, element);
    		});
    	}

    	$$self.$$set = $$new_props => {
    		$$props = assign(assign({}, $$props), exclude_internal_props($$new_props));
    		$$invalidate(3, $$restProps = compute_rest_props($$props, omit_props_names));
    		if ('use' in $$new_props) $$invalidate(0, use = $$new_props.use);
    		if ('$$scope' in $$new_props) $$invalidate(5, $$scope = $$new_props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		get_current_component,
    		forwardEventsBuilder,
    		useActions,
    		use,
    		forwardEvents,
    		element,
    		getElement
    	});

    	$$self.$inject_state = $$new_props => {
    		if ('use' in $$props) $$invalidate(0, use = $$new_props.use);
    		if ('element' in $$props) $$invalidate(1, element = $$new_props.element);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		use,
    		element,
    		forwardEvents,
    		$$restProps,
    		getElement,
    		$$scope,
    		slots,
    		button_binding
    	];
    }

    class Button$1 extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$g, create_fragment$n, safe_not_equal, { use: 0, getElement: 4 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Button",
    			options,
    			id: create_fragment$n.name
    		});
    	}

    	get use() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set use(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get getElement() {
    		return this.$$.ctx[4];
    	}

    	set getElement(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules\@smui\common\dist\elements\H3.svelte generated by Svelte v3.46.4 */
    const file$i = "node_modules\\@smui\\common\\dist\\elements\\H3.svelte";

    function create_fragment$m(ctx) {
    	let h3;
    	let useActions_action;
    	let current;
    	let mounted;
    	let dispose;
    	const default_slot_template = /*#slots*/ ctx[6].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[5], null);
    	let h3_levels = [/*$$restProps*/ ctx[3]];
    	let h3_data = {};

    	for (let i = 0; i < h3_levels.length; i += 1) {
    		h3_data = assign(h3_data, h3_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			h3 = element("h3");
    			if (default_slot) default_slot.c();
    			set_attributes(h3, h3_data);
    			add_location(h3, file$i, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h3, anchor);

    			if (default_slot) {
    				default_slot.m(h3, null);
    			}

    			/*h3_binding*/ ctx[7](h3);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					action_destroyer(useActions_action = useActions.call(null, h3, /*use*/ ctx[0])),
    					action_destroyer(/*forwardEvents*/ ctx[2].call(null, h3))
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 32)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[5],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[5])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[5], dirty, null),
    						null
    					);
    				}
    			}

    			set_attributes(h3, h3_data = get_spread_update(h3_levels, [dirty & /*$$restProps*/ 8 && /*$$restProps*/ ctx[3]]));
    			if (useActions_action && is_function(useActions_action.update) && dirty & /*use*/ 1) useActions_action.update.call(null, /*use*/ ctx[0]);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h3);
    			if (default_slot) default_slot.d(detaching);
    			/*h3_binding*/ ctx[7](null);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$m.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$f($$self, $$props, $$invalidate) {
    	const omit_props_names = ["use","getElement"];
    	let $$restProps = compute_rest_props($$props, omit_props_names);
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('H3', slots, ['default']);
    	let { use = [] } = $$props;
    	const forwardEvents = forwardEventsBuilder(get_current_component());
    	let element;

    	function getElement() {
    		return element;
    	}

    	function h3_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			element = $$value;
    			$$invalidate(1, element);
    		});
    	}

    	$$self.$$set = $$new_props => {
    		$$props = assign(assign({}, $$props), exclude_internal_props($$new_props));
    		$$invalidate(3, $$restProps = compute_rest_props($$props, omit_props_names));
    		if ('use' in $$new_props) $$invalidate(0, use = $$new_props.use);
    		if ('$$scope' in $$new_props) $$invalidate(5, $$scope = $$new_props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		get_current_component,
    		forwardEventsBuilder,
    		useActions,
    		use,
    		forwardEvents,
    		element,
    		getElement
    	});

    	$$self.$inject_state = $$new_props => {
    		if ('use' in $$props) $$invalidate(0, use = $$new_props.use);
    		if ('element' in $$props) $$invalidate(1, element = $$new_props.element);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		use,
    		element,
    		forwardEvents,
    		$$restProps,
    		getElement,
    		$$scope,
    		slots,
    		h3_binding
    	];
    }

    class H3$1 extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$f, create_fragment$m, safe_not_equal, { use: 0, getElement: 4 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "H3",
    			options,
    			id: create_fragment$m.name
    		});
    	}

    	get use() {
    		throw new Error("<H3>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set use(value) {
    		throw new Error("<H3>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get getElement() {
    		return this.$$.ctx[4];
    	}

    	set getElement(value) {
    		throw new Error("<H3>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules\@smui\common\dist\elements\Li.svelte generated by Svelte v3.46.4 */
    const file$h = "node_modules\\@smui\\common\\dist\\elements\\Li.svelte";

    function create_fragment$l(ctx) {
    	let li;
    	let useActions_action;
    	let current;
    	let mounted;
    	let dispose;
    	const default_slot_template = /*#slots*/ ctx[6].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[5], null);
    	let li_levels = [/*$$restProps*/ ctx[3]];
    	let li_data = {};

    	for (let i = 0; i < li_levels.length; i += 1) {
    		li_data = assign(li_data, li_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			li = element("li");
    			if (default_slot) default_slot.c();
    			set_attributes(li, li_data);
    			add_location(li, file$h, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li, anchor);

    			if (default_slot) {
    				default_slot.m(li, null);
    			}

    			/*li_binding*/ ctx[7](li);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					action_destroyer(useActions_action = useActions.call(null, li, /*use*/ ctx[0])),
    					action_destroyer(/*forwardEvents*/ ctx[2].call(null, li))
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 32)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[5],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[5])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[5], dirty, null),
    						null
    					);
    				}
    			}

    			set_attributes(li, li_data = get_spread_update(li_levels, [dirty & /*$$restProps*/ 8 && /*$$restProps*/ ctx[3]]));
    			if (useActions_action && is_function(useActions_action.update) && dirty & /*use*/ 1) useActions_action.update.call(null, /*use*/ ctx[0]);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(li);
    			if (default_slot) default_slot.d(detaching);
    			/*li_binding*/ ctx[7](null);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$l.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$e($$self, $$props, $$invalidate) {
    	const omit_props_names = ["use","getElement"];
    	let $$restProps = compute_rest_props($$props, omit_props_names);
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Li', slots, ['default']);
    	let { use = [] } = $$props;
    	const forwardEvents = forwardEventsBuilder(get_current_component());
    	let element;

    	function getElement() {
    		return element;
    	}

    	function li_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			element = $$value;
    			$$invalidate(1, element);
    		});
    	}

    	$$self.$$set = $$new_props => {
    		$$props = assign(assign({}, $$props), exclude_internal_props($$new_props));
    		$$invalidate(3, $$restProps = compute_rest_props($$props, omit_props_names));
    		if ('use' in $$new_props) $$invalidate(0, use = $$new_props.use);
    		if ('$$scope' in $$new_props) $$invalidate(5, $$scope = $$new_props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		get_current_component,
    		forwardEventsBuilder,
    		useActions,
    		use,
    		forwardEvents,
    		element,
    		getElement
    	});

    	$$self.$inject_state = $$new_props => {
    		if ('use' in $$props) $$invalidate(0, use = $$new_props.use);
    		if ('element' in $$props) $$invalidate(1, element = $$new_props.element);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		use,
    		element,
    		forwardEvents,
    		$$restProps,
    		getElement,
    		$$scope,
    		slots,
    		li_binding
    	];
    }

    class Li$1 extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$e, create_fragment$l, safe_not_equal, { use: 0, getElement: 4 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Li",
    			options,
    			id: create_fragment$l.name
    		});
    	}

    	get use() {
    		throw new Error("<Li>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set use(value) {
    		throw new Error("<Li>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get getElement() {
    		return this.$$.ctx[4];
    	}

    	set getElement(value) {
    		throw new Error("<Li>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules\@smui\common\dist\elements\Nav.svelte generated by Svelte v3.46.4 */
    const file$g = "node_modules\\@smui\\common\\dist\\elements\\Nav.svelte";

    function create_fragment$k(ctx) {
    	let nav;
    	let useActions_action;
    	let current;
    	let mounted;
    	let dispose;
    	const default_slot_template = /*#slots*/ ctx[6].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[5], null);
    	let nav_levels = [/*$$restProps*/ ctx[3]];
    	let nav_data = {};

    	for (let i = 0; i < nav_levels.length; i += 1) {
    		nav_data = assign(nav_data, nav_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			nav = element("nav");
    			if (default_slot) default_slot.c();
    			set_attributes(nav, nav_data);
    			add_location(nav, file$g, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, nav, anchor);

    			if (default_slot) {
    				default_slot.m(nav, null);
    			}

    			/*nav_binding*/ ctx[7](nav);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					action_destroyer(useActions_action = useActions.call(null, nav, /*use*/ ctx[0])),
    					action_destroyer(/*forwardEvents*/ ctx[2].call(null, nav))
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 32)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[5],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[5])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[5], dirty, null),
    						null
    					);
    				}
    			}

    			set_attributes(nav, nav_data = get_spread_update(nav_levels, [dirty & /*$$restProps*/ 8 && /*$$restProps*/ ctx[3]]));
    			if (useActions_action && is_function(useActions_action.update) && dirty & /*use*/ 1) useActions_action.update.call(null, /*use*/ ctx[0]);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(nav);
    			if (default_slot) default_slot.d(detaching);
    			/*nav_binding*/ ctx[7](null);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$k.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$d($$self, $$props, $$invalidate) {
    	const omit_props_names = ["use","getElement"];
    	let $$restProps = compute_rest_props($$props, omit_props_names);
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Nav', slots, ['default']);
    	let { use = [] } = $$props;
    	const forwardEvents = forwardEventsBuilder(get_current_component());
    	let element;

    	function getElement() {
    		return element;
    	}

    	function nav_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			element = $$value;
    			$$invalidate(1, element);
    		});
    	}

    	$$self.$$set = $$new_props => {
    		$$props = assign(assign({}, $$props), exclude_internal_props($$new_props));
    		$$invalidate(3, $$restProps = compute_rest_props($$props, omit_props_names));
    		if ('use' in $$new_props) $$invalidate(0, use = $$new_props.use);
    		if ('$$scope' in $$new_props) $$invalidate(5, $$scope = $$new_props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		get_current_component,
    		forwardEventsBuilder,
    		useActions,
    		use,
    		forwardEvents,
    		element,
    		getElement
    	});

    	$$self.$inject_state = $$new_props => {
    		if ('use' in $$props) $$invalidate(0, use = $$new_props.use);
    		if ('element' in $$props) $$invalidate(1, element = $$new_props.element);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		use,
    		element,
    		forwardEvents,
    		$$restProps,
    		getElement,
    		$$scope,
    		slots,
    		nav_binding
    	];
    }

    class Nav$1 extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$d, create_fragment$k, safe_not_equal, { use: 0, getElement: 4 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Nav",
    			options,
    			id: create_fragment$k.name
    		});
    	}

    	get use() {
    		throw new Error("<Nav>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set use(value) {
    		throw new Error("<Nav>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get getElement() {
    		return this.$$.ctx[4];
    	}

    	set getElement(value) {
    		throw new Error("<Nav>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules\@smui\common\dist\elements\Span.svelte generated by Svelte v3.46.4 */
    const file$f = "node_modules\\@smui\\common\\dist\\elements\\Span.svelte";

    function create_fragment$j(ctx) {
    	let span;
    	let useActions_action;
    	let current;
    	let mounted;
    	let dispose;
    	const default_slot_template = /*#slots*/ ctx[6].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[5], null);
    	let span_levels = [/*$$restProps*/ ctx[3]];
    	let span_data = {};

    	for (let i = 0; i < span_levels.length; i += 1) {
    		span_data = assign(span_data, span_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			span = element("span");
    			if (default_slot) default_slot.c();
    			set_attributes(span, span_data);
    			add_location(span, file$f, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);

    			if (default_slot) {
    				default_slot.m(span, null);
    			}

    			/*span_binding*/ ctx[7](span);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					action_destroyer(useActions_action = useActions.call(null, span, /*use*/ ctx[0])),
    					action_destroyer(/*forwardEvents*/ ctx[2].call(null, span))
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 32)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[5],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[5])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[5], dirty, null),
    						null
    					);
    				}
    			}

    			set_attributes(span, span_data = get_spread_update(span_levels, [dirty & /*$$restProps*/ 8 && /*$$restProps*/ ctx[3]]));
    			if (useActions_action && is_function(useActions_action.update) && dirty & /*use*/ 1) useActions_action.update.call(null, /*use*/ ctx[0]);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    			if (default_slot) default_slot.d(detaching);
    			/*span_binding*/ ctx[7](null);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$j.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$c($$self, $$props, $$invalidate) {
    	const omit_props_names = ["use","getElement"];
    	let $$restProps = compute_rest_props($$props, omit_props_names);
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Span', slots, ['default']);
    	let { use = [] } = $$props;
    	const forwardEvents = forwardEventsBuilder(get_current_component());
    	let element;

    	function getElement() {
    		return element;
    	}

    	function span_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			element = $$value;
    			$$invalidate(1, element);
    		});
    	}

    	$$self.$$set = $$new_props => {
    		$$props = assign(assign({}, $$props), exclude_internal_props($$new_props));
    		$$invalidate(3, $$restProps = compute_rest_props($$props, omit_props_names));
    		if ('use' in $$new_props) $$invalidate(0, use = $$new_props.use);
    		if ('$$scope' in $$new_props) $$invalidate(5, $$scope = $$new_props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		get_current_component,
    		forwardEventsBuilder,
    		useActions,
    		use,
    		forwardEvents,
    		element,
    		getElement
    	});

    	$$self.$inject_state = $$new_props => {
    		if ('use' in $$props) $$invalidate(0, use = $$new_props.use);
    		if ('element' in $$props) $$invalidate(1, element = $$new_props.element);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		use,
    		element,
    		forwardEvents,
    		$$restProps,
    		getElement,
    		$$scope,
    		slots,
    		span_binding
    	];
    }

    class Span$1 extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$c, create_fragment$j, safe_not_equal, { use: 0, getElement: 4 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Span",
    			options,
    			id: create_fragment$j.name
    		});
    	}

    	get use() {
    		throw new Error("<Span>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set use(value) {
    		throw new Error("<Span>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get getElement() {
    		return this.$$.ctx[4];
    	}

    	set getElement(value) {
    		throw new Error("<Span>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules\@smui\common\dist\elements\Ul.svelte generated by Svelte v3.46.4 */
    const file$e = "node_modules\\@smui\\common\\dist\\elements\\Ul.svelte";

    function create_fragment$i(ctx) {
    	let ul;
    	let useActions_action;
    	let current;
    	let mounted;
    	let dispose;
    	const default_slot_template = /*#slots*/ ctx[6].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[5], null);
    	let ul_levels = [/*$$restProps*/ ctx[3]];
    	let ul_data = {};

    	for (let i = 0; i < ul_levels.length; i += 1) {
    		ul_data = assign(ul_data, ul_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			ul = element("ul");
    			if (default_slot) default_slot.c();
    			set_attributes(ul, ul_data);
    			add_location(ul, file$e, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, ul, anchor);

    			if (default_slot) {
    				default_slot.m(ul, null);
    			}

    			/*ul_binding*/ ctx[7](ul);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					action_destroyer(useActions_action = useActions.call(null, ul, /*use*/ ctx[0])),
    					action_destroyer(/*forwardEvents*/ ctx[2].call(null, ul))
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 32)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[5],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[5])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[5], dirty, null),
    						null
    					);
    				}
    			}

    			set_attributes(ul, ul_data = get_spread_update(ul_levels, [dirty & /*$$restProps*/ 8 && /*$$restProps*/ ctx[3]]));
    			if (useActions_action && is_function(useActions_action.update) && dirty & /*use*/ 1) useActions_action.update.call(null, /*use*/ ctx[0]);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(ul);
    			if (default_slot) default_slot.d(detaching);
    			/*ul_binding*/ ctx[7](null);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$i.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$b($$self, $$props, $$invalidate) {
    	const omit_props_names = ["use","getElement"];
    	let $$restProps = compute_rest_props($$props, omit_props_names);
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Ul', slots, ['default']);
    	let { use = [] } = $$props;
    	const forwardEvents = forwardEventsBuilder(get_current_component());
    	let element;

    	function getElement() {
    		return element;
    	}

    	function ul_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			element = $$value;
    			$$invalidate(1, element);
    		});
    	}

    	$$self.$$set = $$new_props => {
    		$$props = assign(assign({}, $$props), exclude_internal_props($$new_props));
    		$$invalidate(3, $$restProps = compute_rest_props($$props, omit_props_names));
    		if ('use' in $$new_props) $$invalidate(0, use = $$new_props.use);
    		if ('$$scope' in $$new_props) $$invalidate(5, $$scope = $$new_props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		get_current_component,
    		forwardEventsBuilder,
    		useActions,
    		use,
    		forwardEvents,
    		element,
    		getElement
    	});

    	$$self.$inject_state = $$new_props => {
    		if ('use' in $$props) $$invalidate(0, use = $$new_props.use);
    		if ('element' in $$props) $$invalidate(1, element = $$new_props.element);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		use,
    		element,
    		forwardEvents,
    		$$restProps,
    		getElement,
    		$$scope,
    		slots,
    		ul_binding
    	];
    }

    class Ul$1 extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$b, create_fragment$i, safe_not_equal, { use: 0, getElement: 4 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Ul",
    			options,
    			id: create_fragment$i.name
    		});
    	}

    	get use() {
    		throw new Error("<Ul>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set use(value) {
    		throw new Error("<Ul>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get getElement() {
    		return this.$$.ctx[4];
    	}

    	set getElement(value) {
    		throw new Error("<Ul>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    const A = A$1;
    const Button = Button$1;
    const Div = Div$1;
    const H3 = H3$1;
    const Li = Li$1;
    const Nav = Nav$1;
    const Span = Span$1;
    const Ul = Ul$1;

    var Row = classAdderBuilder({
        class: 'mdc-top-app-bar__row',
        component: Div,
    });

    /* node_modules\@smui\top-app-bar\dist\Section.svelte generated by Svelte v3.46.4 */
    const file$d = "node_modules\\@smui\\top-app-bar\\dist\\Section.svelte";

    function create_fragment$h(ctx) {
    	let section;
    	let section_class_value;
    	let useActions_action;
    	let current;
    	let mounted;
    	let dispose;
    	const default_slot_template = /*#slots*/ ctx[9].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[8], null);

    	let section_levels = [
    		{
    			class: section_class_value = classMap({
    				[/*className*/ ctx[1]]: true,
    				'mdc-top-app-bar__section': true,
    				'mdc-top-app-bar__section--align-start': /*align*/ ctx[2] === 'start',
    				'mdc-top-app-bar__section--align-end': /*align*/ ctx[2] === 'end'
    			})
    		},
    		/*toolbar*/ ctx[3] ? { role: 'toolbar' } : {},
    		/*$$restProps*/ ctx[6]
    	];

    	let section_data = {};

    	for (let i = 0; i < section_levels.length; i += 1) {
    		section_data = assign(section_data, section_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			section = element("section");
    			if (default_slot) default_slot.c();
    			set_attributes(section, section_data);
    			add_location(section, file$d, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section, anchor);

    			if (default_slot) {
    				default_slot.m(section, null);
    			}

    			/*section_binding*/ ctx[10](section);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					action_destroyer(useActions_action = useActions.call(null, section, /*use*/ ctx[0])),
    					action_destroyer(/*forwardEvents*/ ctx[5].call(null, section))
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 256)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[8],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[8])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[8], dirty, null),
    						null
    					);
    				}
    			}

    			set_attributes(section, section_data = get_spread_update(section_levels, [
    				(!current || dirty & /*className, align*/ 6 && section_class_value !== (section_class_value = classMap({
    					[/*className*/ ctx[1]]: true,
    					'mdc-top-app-bar__section': true,
    					'mdc-top-app-bar__section--align-start': /*align*/ ctx[2] === 'start',
    					'mdc-top-app-bar__section--align-end': /*align*/ ctx[2] === 'end'
    				}))) && { class: section_class_value },
    				dirty & /*toolbar*/ 8 && (/*toolbar*/ ctx[3] ? { role: 'toolbar' } : {}),
    				dirty & /*$$restProps*/ 64 && /*$$restProps*/ ctx[6]
    			]));

    			if (useActions_action && is_function(useActions_action.update) && dirty & /*use*/ 1) useActions_action.update.call(null, /*use*/ ctx[0]);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section);
    			if (default_slot) default_slot.d(detaching);
    			/*section_binding*/ ctx[10](null);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$h.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$a($$self, $$props, $$invalidate) {
    	const omit_props_names = ["use","class","align","toolbar","getElement"];
    	let $$restProps = compute_rest_props($$props, omit_props_names);
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Section', slots, ['default']);
    	const forwardEvents = forwardEventsBuilder(get_current_component());
    	let { use = [] } = $$props;
    	let { class: className = '' } = $$props;
    	let { align = 'start' } = $$props;
    	let { toolbar = false } = $$props;
    	let element;

    	setContext('SMUI:icon-button:context', toolbar
    	? 'top-app-bar:action'
    	: 'top-app-bar:navigation');

    	setContext('SMUI:button:context', toolbar
    	? 'top-app-bar:action'
    	: 'top-app-bar:navigation');

    	function getElement() {
    		return element;
    	}

    	function section_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			element = $$value;
    			$$invalidate(4, element);
    		});
    	}

    	$$self.$$set = $$new_props => {
    		$$props = assign(assign({}, $$props), exclude_internal_props($$new_props));
    		$$invalidate(6, $$restProps = compute_rest_props($$props, omit_props_names));
    		if ('use' in $$new_props) $$invalidate(0, use = $$new_props.use);
    		if ('class' in $$new_props) $$invalidate(1, className = $$new_props.class);
    		if ('align' in $$new_props) $$invalidate(2, align = $$new_props.align);
    		if ('toolbar' in $$new_props) $$invalidate(3, toolbar = $$new_props.toolbar);
    		if ('$$scope' in $$new_props) $$invalidate(8, $$scope = $$new_props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		setContext,
    		get_current_component,
    		forwardEventsBuilder,
    		classMap,
    		useActions,
    		forwardEvents,
    		use,
    		className,
    		align,
    		toolbar,
    		element,
    		getElement
    	});

    	$$self.$inject_state = $$new_props => {
    		if ('use' in $$props) $$invalidate(0, use = $$new_props.use);
    		if ('className' in $$props) $$invalidate(1, className = $$new_props.className);
    		if ('align' in $$props) $$invalidate(2, align = $$new_props.align);
    		if ('toolbar' in $$props) $$invalidate(3, toolbar = $$new_props.toolbar);
    		if ('element' in $$props) $$invalidate(4, element = $$new_props.element);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		use,
    		className,
    		align,
    		toolbar,
    		element,
    		forwardEvents,
    		$$restProps,
    		getElement,
    		$$scope,
    		slots,
    		section_binding
    	];
    }

    class Section$1 extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$a, create_fragment$h, safe_not_equal, {
    			use: 0,
    			class: 1,
    			align: 2,
    			toolbar: 3,
    			getElement: 7
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Section",
    			options,
    			id: create_fragment$h.name
    		});
    	}

    	get use() {
    		throw new Error("<Section>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set use(value) {
    		throw new Error("<Section>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get class() {
    		throw new Error("<Section>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set class(value) {
    		throw new Error("<Section>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get align() {
    		throw new Error("<Section>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set align(value) {
    		throw new Error("<Section>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get toolbar() {
    		throw new Error("<Section>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set toolbar(value) {
    		throw new Error("<Section>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get getElement() {
    		return this.$$.ctx[7];
    	}

    	set getElement(value) {
    		throw new Error("<Section>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    var Title = classAdderBuilder({
        class: 'mdc-top-app-bar__title',
        component: Span,
    });

    const Section = Section$1;

    /**
     * @license
     * Copyright 2018 Google Inc.
     *
     * Permission is hereby granted, free of charge, to any person obtaining a copy
     * of this software and associated documentation files (the "Software"), to deal
     * in the Software without restriction, including without limitation the rights
     * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
     * copies of the Software, and to permit persons to whom the Software is
     * furnished to do so, subject to the following conditions:
     *
     * The above copyright notice and this permission notice shall be included in
     * all copies or substantial portions of the Software.
     *
     * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
     * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
     * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
     * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
     * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
     * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
     * THE SOFTWARE.
     */
    var cssClasses$6 = {
        ICON_BUTTON_ON: 'mdc-icon-button--on',
        ROOT: 'mdc-icon-button',
    };
    var strings$3 = {
        ARIA_LABEL: 'aria-label',
        ARIA_PRESSED: 'aria-pressed',
        DATA_ARIA_LABEL_OFF: 'data-aria-label-off',
        DATA_ARIA_LABEL_ON: 'data-aria-label-on',
        CHANGE_EVENT: 'MDCIconButtonToggle:change',
    };

    /**
     * @license
     * Copyright 2018 Google Inc.
     *
     * Permission is hereby granted, free of charge, to any person obtaining a copy
     * of this software and associated documentation files (the "Software"), to deal
     * in the Software without restriction, including without limitation the rights
     * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
     * copies of the Software, and to permit persons to whom the Software is
     * furnished to do so, subject to the following conditions:
     *
     * The above copyright notice and this permission notice shall be included in
     * all copies or substantial portions of the Software.
     *
     * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
     * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
     * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
     * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
     * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
     * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
     * THE SOFTWARE.
     */
    var MDCIconButtonToggleFoundation = /** @class */ (function (_super) {
        __extends(MDCIconButtonToggleFoundation, _super);
        function MDCIconButtonToggleFoundation(adapter) {
            var _this = _super.call(this, __assign(__assign({}, MDCIconButtonToggleFoundation.defaultAdapter), adapter)) || this;
            /**
             * Whether the icon button has an aria label that changes depending on
             * toggled state.
             */
            _this.hasToggledAriaLabel = false;
            return _this;
        }
        Object.defineProperty(MDCIconButtonToggleFoundation, "cssClasses", {
            get: function () {
                return cssClasses$6;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(MDCIconButtonToggleFoundation, "strings", {
            get: function () {
                return strings$3;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(MDCIconButtonToggleFoundation, "defaultAdapter", {
            get: function () {
                return {
                    addClass: function () { return undefined; },
                    hasClass: function () { return false; },
                    notifyChange: function () { return undefined; },
                    removeClass: function () { return undefined; },
                    getAttr: function () { return null; },
                    setAttr: function () { return undefined; },
                };
            },
            enumerable: false,
            configurable: true
        });
        MDCIconButtonToggleFoundation.prototype.init = function () {
            var ariaLabelOn = this.adapter.getAttr(strings$3.DATA_ARIA_LABEL_ON);
            var ariaLabelOff = this.adapter.getAttr(strings$3.DATA_ARIA_LABEL_OFF);
            if (ariaLabelOn && ariaLabelOff) {
                if (this.adapter.getAttr(strings$3.ARIA_PRESSED) !== null) {
                    throw new Error('MDCIconButtonToggleFoundation: Button should not set ' +
                        '`aria-pressed` if it has a toggled aria label.');
                }
                this.hasToggledAriaLabel = true;
            }
            else {
                this.adapter.setAttr(strings$3.ARIA_PRESSED, String(this.isOn()));
            }
        };
        MDCIconButtonToggleFoundation.prototype.handleClick = function () {
            this.toggle();
            this.adapter.notifyChange({ isOn: this.isOn() });
        };
        MDCIconButtonToggleFoundation.prototype.isOn = function () {
            return this.adapter.hasClass(cssClasses$6.ICON_BUTTON_ON);
        };
        MDCIconButtonToggleFoundation.prototype.toggle = function (isOn) {
            if (isOn === void 0) { isOn = !this.isOn(); }
            // Toggle UI based on state.
            if (isOn) {
                this.adapter.addClass(cssClasses$6.ICON_BUTTON_ON);
            }
            else {
                this.adapter.removeClass(cssClasses$6.ICON_BUTTON_ON);
            }
            // Toggle aria attributes based on state.
            if (this.hasToggledAriaLabel) {
                var ariaLabel = isOn ?
                    this.adapter.getAttr(strings$3.DATA_ARIA_LABEL_ON) :
                    this.adapter.getAttr(strings$3.DATA_ARIA_LABEL_OFF);
                this.adapter.setAttr(strings$3.ARIA_LABEL, ariaLabel || '');
            }
            else {
                this.adapter.setAttr(strings$3.ARIA_PRESSED, "" + isOn);
            }
        };
        return MDCIconButtonToggleFoundation;
    }(MDCFoundation));

    /**
     * @license
     * Copyright 2020 Google Inc.
     *
     * Permission is hereby granted, free of charge, to any person obtaining a copy
     * of this software and associated documentation files (the "Software"), to deal
     * in the Software without restriction, including without limitation the rights
     * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
     * copies of the Software, and to permit persons to whom the Software is
     * furnished to do so, subject to the following conditions:
     *
     * The above copyright notice and this permission notice shall be included in
     * all copies or substantial portions of the Software.
     *
     * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
     * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
     * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
     * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
     * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
     * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
     * THE SOFTWARE.
     */
    var FOCUS_SENTINEL_CLASS = 'mdc-dom-focus-sentinel';
    /**
     * Utility to trap focus in a given root element, e.g. for modal components such
     * as dialogs. The root should have at least one focusable child element,
     * for setting initial focus when trapping focus.
     * Also tracks the previously focused element, and restores focus to that
     * element when releasing focus.
     */
    var FocusTrap = /** @class */ (function () {
        function FocusTrap(root, options) {
            if (options === void 0) { options = {}; }
            this.root = root;
            this.options = options;
            // Previously focused element before trapping focus.
            this.elFocusedBeforeTrapFocus = null;
        }
        /**
         * Traps focus in `root`. Also focuses on either `initialFocusEl` if set;
         * otherwises sets initial focus to the first focusable child element.
         */
        FocusTrap.prototype.trapFocus = function () {
            var focusableEls = this.getFocusableElements(this.root);
            if (focusableEls.length === 0) {
                throw new Error('FocusTrap: Element must have at least one focusable child.');
            }
            this.elFocusedBeforeTrapFocus =
                document.activeElement instanceof HTMLElement ? document.activeElement :
                    null;
            this.wrapTabFocus(this.root);
            if (!this.options.skipInitialFocus) {
                this.focusInitialElement(focusableEls, this.options.initialFocusEl);
            }
        };
        /**
         * Releases focus from `root`. Also restores focus to the previously focused
         * element.
         */
        FocusTrap.prototype.releaseFocus = function () {
            [].slice.call(this.root.querySelectorAll("." + FOCUS_SENTINEL_CLASS))
                .forEach(function (sentinelEl) {
                sentinelEl.parentElement.removeChild(sentinelEl);
            });
            if (!this.options.skipRestoreFocus && this.elFocusedBeforeTrapFocus) {
                this.elFocusedBeforeTrapFocus.focus();
            }
        };
        /**
         * Wraps tab focus within `el` by adding two hidden sentinel divs which are
         * used to mark the beginning and the end of the tabbable region. When
         * focused, these sentinel elements redirect focus to the first/last
         * children elements of the tabbable region, ensuring that focus is trapped
         * within that region.
         */
        FocusTrap.prototype.wrapTabFocus = function (el) {
            var _this = this;
            var sentinelStart = this.createSentinel();
            var sentinelEnd = this.createSentinel();
            sentinelStart.addEventListener('focus', function () {
                var focusableEls = _this.getFocusableElements(el);
                if (focusableEls.length > 0) {
                    focusableEls[focusableEls.length - 1].focus();
                }
            });
            sentinelEnd.addEventListener('focus', function () {
                var focusableEls = _this.getFocusableElements(el);
                if (focusableEls.length > 0) {
                    focusableEls[0].focus();
                }
            });
            el.insertBefore(sentinelStart, el.children[0]);
            el.appendChild(sentinelEnd);
        };
        /**
         * Focuses on `initialFocusEl` if defined and a child of the root element.
         * Otherwise, focuses on the first focusable child element of the root.
         */
        FocusTrap.prototype.focusInitialElement = function (focusableEls, initialFocusEl) {
            var focusIndex = 0;
            if (initialFocusEl) {
                focusIndex = Math.max(focusableEls.indexOf(initialFocusEl), 0);
            }
            focusableEls[focusIndex].focus();
        };
        FocusTrap.prototype.getFocusableElements = function (root) {
            var focusableEls = [].slice.call(root.querySelectorAll('[autofocus], [tabindex], a, input, textarea, select, button'));
            return focusableEls.filter(function (el) {
                var isDisabledOrHidden = el.getAttribute('aria-disabled') === 'true' ||
                    el.getAttribute('disabled') != null ||
                    el.getAttribute('hidden') != null ||
                    el.getAttribute('aria-hidden') === 'true';
                var isTabbableAndVisible = el.tabIndex >= 0 &&
                    el.getBoundingClientRect().width > 0 &&
                    !el.classList.contains(FOCUS_SENTINEL_CLASS) && !isDisabledOrHidden;
                var isProgrammaticallyHidden = false;
                if (isTabbableAndVisible) {
                    var style = getComputedStyle(el);
                    isProgrammaticallyHidden =
                        style.display === 'none' || style.visibility === 'hidden';
                }
                return isTabbableAndVisible && !isProgrammaticallyHidden;
            });
        };
        FocusTrap.prototype.createSentinel = function () {
            var sentinel = document.createElement('div');
            sentinel.setAttribute('tabindex', '0');
            // Don't announce in screen readers.
            sentinel.setAttribute('aria-hidden', 'true');
            sentinel.classList.add(FOCUS_SENTINEL_CLASS);
            return sentinel;
        };
        return FocusTrap;
    }());

    var domFocusTrap = /*#__PURE__*/Object.freeze({
        __proto__: null,
        FocusTrap: FocusTrap
    });

    /**
     * @license
     * Copyright 2020 Google Inc.
     *
     * Permission is hereby granted, free of charge, to any person obtaining a copy
     * of this software and associated documentation files (the "Software"), to deal
     * in the Software without restriction, including without limitation the rights
     * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
     * copies of the Software, and to permit persons to whom the Software is
     * furnished to do so, subject to the following conditions:
     *
     * The above copyright notice and this permission notice shall be included in
     * all copies or substantial portions of the Software.
     *
     * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
     * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
     * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
     * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
     * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
     * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
     * THE SOFTWARE.
     */
    /**
     * KEY provides normalized string values for keys.
     */
    var KEY = {
        UNKNOWN: 'Unknown',
        BACKSPACE: 'Backspace',
        ENTER: 'Enter',
        SPACEBAR: 'Spacebar',
        PAGE_UP: 'PageUp',
        PAGE_DOWN: 'PageDown',
        END: 'End',
        HOME: 'Home',
        ARROW_LEFT: 'ArrowLeft',
        ARROW_UP: 'ArrowUp',
        ARROW_RIGHT: 'ArrowRight',
        ARROW_DOWN: 'ArrowDown',
        DELETE: 'Delete',
        ESCAPE: 'Escape',
        TAB: 'Tab',
    };
    var normalizedKeys = new Set();
    // IE11 has no support for new Map with iterable so we need to initialize this
    // by hand.
    normalizedKeys.add(KEY.BACKSPACE);
    normalizedKeys.add(KEY.ENTER);
    normalizedKeys.add(KEY.SPACEBAR);
    normalizedKeys.add(KEY.PAGE_UP);
    normalizedKeys.add(KEY.PAGE_DOWN);
    normalizedKeys.add(KEY.END);
    normalizedKeys.add(KEY.HOME);
    normalizedKeys.add(KEY.ARROW_LEFT);
    normalizedKeys.add(KEY.ARROW_UP);
    normalizedKeys.add(KEY.ARROW_RIGHT);
    normalizedKeys.add(KEY.ARROW_DOWN);
    normalizedKeys.add(KEY.DELETE);
    normalizedKeys.add(KEY.ESCAPE);
    normalizedKeys.add(KEY.TAB);
    var KEY_CODE = {
        BACKSPACE: 8,
        ENTER: 13,
        SPACEBAR: 32,
        PAGE_UP: 33,
        PAGE_DOWN: 34,
        END: 35,
        HOME: 36,
        ARROW_LEFT: 37,
        ARROW_UP: 38,
        ARROW_RIGHT: 39,
        ARROW_DOWN: 40,
        DELETE: 46,
        ESCAPE: 27,
        TAB: 9,
    };
    var mappedKeyCodes = new Map();
    // IE11 has no support for new Map with iterable so we need to initialize this
    // by hand.
    mappedKeyCodes.set(KEY_CODE.BACKSPACE, KEY.BACKSPACE);
    mappedKeyCodes.set(KEY_CODE.ENTER, KEY.ENTER);
    mappedKeyCodes.set(KEY_CODE.SPACEBAR, KEY.SPACEBAR);
    mappedKeyCodes.set(KEY_CODE.PAGE_UP, KEY.PAGE_UP);
    mappedKeyCodes.set(KEY_CODE.PAGE_DOWN, KEY.PAGE_DOWN);
    mappedKeyCodes.set(KEY_CODE.END, KEY.END);
    mappedKeyCodes.set(KEY_CODE.HOME, KEY.HOME);
    mappedKeyCodes.set(KEY_CODE.ARROW_LEFT, KEY.ARROW_LEFT);
    mappedKeyCodes.set(KEY_CODE.ARROW_UP, KEY.ARROW_UP);
    mappedKeyCodes.set(KEY_CODE.ARROW_RIGHT, KEY.ARROW_RIGHT);
    mappedKeyCodes.set(KEY_CODE.ARROW_DOWN, KEY.ARROW_DOWN);
    mappedKeyCodes.set(KEY_CODE.DELETE, KEY.DELETE);
    mappedKeyCodes.set(KEY_CODE.ESCAPE, KEY.ESCAPE);
    mappedKeyCodes.set(KEY_CODE.TAB, KEY.TAB);
    var navigationKeys = new Set();
    // IE11 has no support for new Set with iterable so we need to initialize this
    // by hand.
    navigationKeys.add(KEY.PAGE_UP);
    navigationKeys.add(KEY.PAGE_DOWN);
    navigationKeys.add(KEY.END);
    navigationKeys.add(KEY.HOME);
    navigationKeys.add(KEY.ARROW_LEFT);
    navigationKeys.add(KEY.ARROW_UP);
    navigationKeys.add(KEY.ARROW_RIGHT);
    navigationKeys.add(KEY.ARROW_DOWN);
    /**
     * normalizeKey returns the normalized string for a navigational action.
     */
    function normalizeKey(evt) {
        var key = evt.key;
        // If the event already has a normalized key, return it
        if (normalizedKeys.has(key)) {
            return key;
        }
        // tslint:disable-next-line:deprecation
        var mappedKey = mappedKeyCodes.get(evt.keyCode);
        if (mappedKey) {
            return mappedKey;
        }
        return KEY.UNKNOWN;
    }

    const { applyPassive } = events;
    const { matches } = ponyfill;
    function Ripple(node, { ripple = true, surface = false, unbounded = false, disabled = false, color, active, rippleElement, eventTarget, activeTarget, addClass = (className) => node.classList.add(className), removeClass = (className) => node.classList.remove(className), addStyle = (name, value) => node.style.setProperty(name, value), initPromise = Promise.resolve(), } = {}) {
        let instance;
        let addLayoutListener = getContext('SMUI:addLayoutListener');
        let removeLayoutListener;
        let oldActive = active;
        let oldEventTarget = eventTarget;
        let oldActiveTarget = activeTarget;
        function handleProps() {
            if (surface) {
                addClass('mdc-ripple-surface');
                if (color === 'primary') {
                    addClass('smui-ripple-surface--primary');
                    removeClass('smui-ripple-surface--secondary');
                }
                else if (color === 'secondary') {
                    removeClass('smui-ripple-surface--primary');
                    addClass('smui-ripple-surface--secondary');
                }
                else {
                    removeClass('smui-ripple-surface--primary');
                    removeClass('smui-ripple-surface--secondary');
                }
            }
            else {
                removeClass('mdc-ripple-surface');
                removeClass('smui-ripple-surface--primary');
                removeClass('smui-ripple-surface--secondary');
            }
            // Handle activation first.
            if (instance && oldActive !== active) {
                oldActive = active;
                if (active) {
                    instance.activate();
                }
                else if (active === false) {
                    instance.deactivate();
                }
            }
            // Then create/destroy an instance.
            if (ripple && !instance) {
                instance = new MDCRippleFoundation({
                    addClass,
                    browserSupportsCssVars: () => supportsCssVariables(window),
                    computeBoundingRect: () => (rippleElement || node).getBoundingClientRect(),
                    containsEventTarget: (target) => node.contains(target),
                    deregisterDocumentInteractionHandler: (evtType, handler) => document.documentElement.removeEventListener(evtType, handler, applyPassive()),
                    deregisterInteractionHandler: (evtType, handler) => (eventTarget || node).removeEventListener(evtType, handler, applyPassive()),
                    deregisterResizeHandler: (handler) => window.removeEventListener('resize', handler),
                    getWindowPageOffset: () => ({
                        x: window.pageXOffset,
                        y: window.pageYOffset,
                    }),
                    isSurfaceActive: () => active == null ? matches(activeTarget || node, ':active') : active,
                    isSurfaceDisabled: () => !!disabled,
                    isUnbounded: () => !!unbounded,
                    registerDocumentInteractionHandler: (evtType, handler) => document.documentElement.addEventListener(evtType, handler, applyPassive()),
                    registerInteractionHandler: (evtType, handler) => (eventTarget || node).addEventListener(evtType, handler, applyPassive()),
                    registerResizeHandler: (handler) => window.addEventListener('resize', handler),
                    removeClass,
                    updateCssVariable: addStyle,
                });
                initPromise.then(() => {
                    if (instance) {
                        instance.init();
                        instance.setUnbounded(unbounded);
                    }
                });
            }
            else if (instance && !ripple) {
                initPromise.then(() => {
                    if (instance) {
                        instance.destroy();
                        instance = undefined;
                    }
                });
            }
            // Now handle event/active targets
            if (instance &&
                (oldEventTarget !== eventTarget || oldActiveTarget !== activeTarget)) {
                oldEventTarget = eventTarget;
                oldActiveTarget = activeTarget;
                instance.destroy();
                requestAnimationFrame(() => {
                    if (instance) {
                        instance.init();
                        instance.setUnbounded(unbounded);
                    }
                });
            }
            if (!ripple && unbounded) {
                addClass('mdc-ripple-upgraded--unbounded');
            }
        }
        handleProps();
        if (addLayoutListener) {
            removeLayoutListener = addLayoutListener(layout);
        }
        function layout() {
            if (instance) {
                instance.layout();
            }
        }
        return {
            update(props) {
                ({
                    ripple,
                    surface,
                    unbounded,
                    disabled,
                    color,
                    active,
                    rippleElement,
                    eventTarget,
                    activeTarget,
                    addClass,
                    removeClass,
                    addStyle,
                    initPromise,
                } = Object.assign({ ripple: true, surface: false, unbounded: false, disabled: false, color: undefined, active: undefined, rippleElement: undefined, eventTarget: undefined, activeTarget: undefined, addClass: (className) => node.classList.add(className), removeClass: (className) => node.classList.remove(className), addStyle: (name, value) => node.style.setProperty(name, value), initPromise: Promise.resolve() }, props));
                handleProps();
            },
            destroy() {
                if (instance) {
                    instance.destroy();
                    instance = undefined;
                    removeClass('mdc-ripple-surface');
                    removeClass('smui-ripple-surface--primary');
                    removeClass('smui-ripple-surface--secondary');
                }
                if (removeLayoutListener) {
                    removeLayoutListener();
                }
            },
        };
    }

    /* node_modules\@smui\icon-button\dist\IconButton.svelte generated by Svelte v3.46.4 */
    const file$c = "node_modules\\@smui\\icon-button\\dist\\IconButton.svelte";

    // (61:10) {#if touch}
    function create_if_block$7(ctx) {
    	let div;

    	const block = {
    		c: function create() {
    			div = element("div");
    			attr_dev(div, "class", "mdc-icon-button__touch");
    			add_location(div, file$c, 60, 21, 1955);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$7.name,
    		type: "if",
    		source: "(61:10) {#if touch}",
    		ctx
    	});

    	return block;
    }

    // (1:0) <svelte:component   this={component}   bind:this={element}   use={[     [       Ripple,       {         ripple,         unbounded: true,         color,         disabled: !!$$restProps.disabled,         addClass,         removeClass,         addStyle,       },     ],     forwardEvents,     ...use,   ]}   class={classMap({     [className]: true,     'mdc-icon-button': true,     'mdc-icon-button--on': !isUninitializedValue(pressed) && pressed,     'mdc-icon-button--touch': touch,     'mdc-icon-button--display-flex': displayFlex,     'smui-icon-button--size-button': size === 'button',     'mdc-icon-button--reduced-size': size === 'mini' || size === 'button',     'mdc-card__action': context === 'card:action',     'mdc-card__action--icon': context === 'card:action',     'mdc-top-app-bar__navigation-icon': context === 'top-app-bar:navigation',     'mdc-top-app-bar__action-item': context === 'top-app-bar:action',     'mdc-snackbar__dismiss': context === 'snackbar:actions',     'mdc-data-table__pagination-button': context === 'data-table:pagination',     'mdc-data-table__sort-icon-button':       context === 'data-table:sortable-header-cell',     'mdc-dialog__close': context === 'dialog:header' && action === 'close',     ...internalClasses,   })}   style={Object.entries(internalStyles)     .map(([name, value]) => `${name}: ${value};`)     .concat([style])     .join(' ')}   aria-pressed={!isUninitializedValue(pressed)     ? pressed       ? 'true'       : 'false'     : null}   aria-label={pressed ? ariaLabelOn : ariaLabelOff}   data-aria-label-on={ariaLabelOn}   data-aria-label-off={ariaLabelOff}   aria-describedby={ariaDescribedby}   on:click={() => instance && instance.handleClick()}   on:click={() =>     context === 'top-app-bar:navigation' &&     dispatch(getElement(), 'SMUITopAppBarIconButton:nav')}   {href}   {...actionProp}   {...internalAttrs}   {...$$restProps}   >
    function create_default_slot$9(ctx) {
    	let div;
    	let t;
    	let if_block_anchor;
    	let current;
    	const default_slot_template = /*#slots*/ ctx[32].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[36], null);
    	let if_block = /*touch*/ ctx[8] && create_if_block$7(ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			t = space();
    			if (default_slot) default_slot.c();
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    			attr_dev(div, "class", "mdc-icon-button__ripple");
    			add_location(div, file$c, 59, 3, 1894);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			insert_dev(target, t, anchor);

    			if (default_slot) {
    				default_slot.m(target, anchor);
    			}

    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty[1] & /*$$scope*/ 32)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[36],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[36])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[36], dirty, null),
    						null
    					);
    				}
    			}

    			if (/*touch*/ ctx[8]) {
    				if (if_block) ; else {
    					if_block = create_if_block$7(ctx);
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (detaching) detach_dev(t);
    			if (default_slot) default_slot.d(detaching);
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$9.name,
    		type: "slot",
    		source: "(1:0) <svelte:component   this={component}   bind:this={element}   use={[     [       Ripple,       {         ripple,         unbounded: true,         color,         disabled: !!$$restProps.disabled,         addClass,         removeClass,         addStyle,       },     ],     forwardEvents,     ...use,   ]}   class={classMap({     [className]: true,     'mdc-icon-button': true,     'mdc-icon-button--on': !isUninitializedValue(pressed) && pressed,     'mdc-icon-button--touch': touch,     'mdc-icon-button--display-flex': displayFlex,     'smui-icon-button--size-button': size === 'button',     'mdc-icon-button--reduced-size': size === 'mini' || size === 'button',     'mdc-card__action': context === 'card:action',     'mdc-card__action--icon': context === 'card:action',     'mdc-top-app-bar__navigation-icon': context === 'top-app-bar:navigation',     'mdc-top-app-bar__action-item': context === 'top-app-bar:action',     'mdc-snackbar__dismiss': context === 'snackbar:actions',     'mdc-data-table__pagination-button': context === 'data-table:pagination',     'mdc-data-table__sort-icon-button':       context === 'data-table:sortable-header-cell',     'mdc-dialog__close': context === 'dialog:header' && action === 'close',     ...internalClasses,   })}   style={Object.entries(internalStyles)     .map(([name, value]) => `${name}: ${value};`)     .concat([style])     .join(' ')}   aria-pressed={!isUninitializedValue(pressed)     ? pressed       ? 'true'       : 'false'     : null}   aria-label={pressed ? ariaLabelOn : ariaLabelOff}   data-aria-label-on={ariaLabelOn}   data-aria-label-off={ariaLabelOff}   aria-describedby={ariaDescribedby}   on:click={() => instance && instance.handleClick()}   on:click={() =>     context === 'top-app-bar:navigation' &&     dispatch(getElement(), 'SMUITopAppBarIconButton:nav')}   {href}   {...actionProp}   {...internalAttrs}   {...$$restProps}   >",
    		ctx
    	});

    	return block;
    }

    function create_fragment$g(ctx) {
    	let switch_instance;
    	let switch_instance_anchor;
    	let current;

    	const switch_instance_spread_levels = [
    		{
    			use: [
    				[
    					Ripple,
    					{
    						ripple: /*ripple*/ ctx[4],
    						unbounded: true,
    						color: /*color*/ ctx[5],
    						disabled: !!/*$$restProps*/ ctx[28].disabled,
    						addClass: /*addClass*/ ctx[25],
    						removeClass: /*removeClass*/ ctx[26],
    						addStyle: /*addStyle*/ ctx[27]
    					}
    				],
    				/*forwardEvents*/ ctx[21],
    				.../*use*/ ctx[1]
    			]
    		},
    		{
    			class: classMap({
    				[/*className*/ ctx[2]]: true,
    				'mdc-icon-button': true,
    				'mdc-icon-button--on': !/*isUninitializedValue*/ ctx[22](/*pressed*/ ctx[0]) && /*pressed*/ ctx[0],
    				'mdc-icon-button--touch': /*touch*/ ctx[8],
    				'mdc-icon-button--display-flex': /*displayFlex*/ ctx[9],
    				'smui-icon-button--size-button': /*size*/ ctx[10] === 'button',
    				'mdc-icon-button--reduced-size': /*size*/ ctx[10] === 'mini' || /*size*/ ctx[10] === 'button',
    				'mdc-card__action': /*context*/ ctx[23] === 'card:action',
    				'mdc-card__action--icon': /*context*/ ctx[23] === 'card:action',
    				'mdc-top-app-bar__navigation-icon': /*context*/ ctx[23] === 'top-app-bar:navigation',
    				'mdc-top-app-bar__action-item': /*context*/ ctx[23] === 'top-app-bar:action',
    				'mdc-snackbar__dismiss': /*context*/ ctx[23] === 'snackbar:actions',
    				'mdc-data-table__pagination-button': /*context*/ ctx[23] === 'data-table:pagination',
    				'mdc-data-table__sort-icon-button': /*context*/ ctx[23] === 'data-table:sortable-header-cell',
    				'mdc-dialog__close': /*context*/ ctx[23] === 'dialog:header' && /*action*/ ctx[12] === 'close',
    				.../*internalClasses*/ ctx[17]
    			})
    		},
    		{
    			style: Object.entries(/*internalStyles*/ ctx[18]).map(func$5).concat([/*style*/ ctx[3]]).join(' ')
    		},
    		{
    			"aria-pressed": !/*isUninitializedValue*/ ctx[22](/*pressed*/ ctx[0])
    			? /*pressed*/ ctx[0] ? 'true' : 'false'
    			: null
    		},
    		{
    			"aria-label": /*pressed*/ ctx[0]
    			? /*ariaLabelOn*/ ctx[6]
    			: /*ariaLabelOff*/ ctx[7]
    		},
    		{
    			"data-aria-label-on": /*ariaLabelOn*/ ctx[6]
    		},
    		{
    			"data-aria-label-off": /*ariaLabelOff*/ ctx[7]
    		},
    		{
    			"aria-describedby": /*ariaDescribedby*/ ctx[24]
    		},
    		{ href: /*href*/ ctx[11] },
    		/*actionProp*/ ctx[20],
    		/*internalAttrs*/ ctx[19],
    		/*$$restProps*/ ctx[28]
    	];

    	var switch_value = /*component*/ ctx[13];

    	function switch_props(ctx) {
    		let switch_instance_props = {
    			$$slots: { default: [create_default_slot$9] },
    			$$scope: { ctx }
    		};

    		for (let i = 0; i < switch_instance_spread_levels.length; i += 1) {
    			switch_instance_props = assign(switch_instance_props, switch_instance_spread_levels[i]);
    		}

    		return {
    			props: switch_instance_props,
    			$$inline: true
    		};
    	}

    	if (switch_value) {
    		switch_instance = new switch_value(switch_props(ctx));
    		/*switch_instance_binding*/ ctx[33](switch_instance);
    		switch_instance.$on("click", /*click_handler*/ ctx[34]);
    		switch_instance.$on("click", /*click_handler_1*/ ctx[35]);
    	}

    	const block = {
    		c: function create() {
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			switch_instance_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (switch_instance) {
    				mount_component(switch_instance, target, anchor);
    			}

    			insert_dev(target, switch_instance_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const switch_instance_changes = (dirty[0] & /*ripple, color, $$restProps, addClass, removeClass, addStyle, forwardEvents, use, className, isUninitializedValue, pressed, touch, displayFlex, size, context, action, internalClasses, internalStyles, style, ariaLabelOn, ariaLabelOff, ariaDescribedby, href, actionProp, internalAttrs*/ 536748031)
    			? get_spread_update(switch_instance_spread_levels, [
    					dirty[0] & /*ripple, color, $$restProps, addClass, removeClass, addStyle, forwardEvents, use*/ 505413682 && {
    						use: [
    							[
    								Ripple,
    								{
    									ripple: /*ripple*/ ctx[4],
    									unbounded: true,
    									color: /*color*/ ctx[5],
    									disabled: !!/*$$restProps*/ ctx[28].disabled,
    									addClass: /*addClass*/ ctx[25],
    									removeClass: /*removeClass*/ ctx[26],
    									addStyle: /*addStyle*/ ctx[27]
    								}
    							],
    							/*forwardEvents*/ ctx[21],
    							.../*use*/ ctx[1]
    						]
    					},
    					dirty[0] & /*className, isUninitializedValue, pressed, touch, displayFlex, size, context, action, internalClasses*/ 12719877 && {
    						class: classMap({
    							[/*className*/ ctx[2]]: true,
    							'mdc-icon-button': true,
    							'mdc-icon-button--on': !/*isUninitializedValue*/ ctx[22](/*pressed*/ ctx[0]) && /*pressed*/ ctx[0],
    							'mdc-icon-button--touch': /*touch*/ ctx[8],
    							'mdc-icon-button--display-flex': /*displayFlex*/ ctx[9],
    							'smui-icon-button--size-button': /*size*/ ctx[10] === 'button',
    							'mdc-icon-button--reduced-size': /*size*/ ctx[10] === 'mini' || /*size*/ ctx[10] === 'button',
    							'mdc-card__action': /*context*/ ctx[23] === 'card:action',
    							'mdc-card__action--icon': /*context*/ ctx[23] === 'card:action',
    							'mdc-top-app-bar__navigation-icon': /*context*/ ctx[23] === 'top-app-bar:navigation',
    							'mdc-top-app-bar__action-item': /*context*/ ctx[23] === 'top-app-bar:action',
    							'mdc-snackbar__dismiss': /*context*/ ctx[23] === 'snackbar:actions',
    							'mdc-data-table__pagination-button': /*context*/ ctx[23] === 'data-table:pagination',
    							'mdc-data-table__sort-icon-button': /*context*/ ctx[23] === 'data-table:sortable-header-cell',
    							'mdc-dialog__close': /*context*/ ctx[23] === 'dialog:header' && /*action*/ ctx[12] === 'close',
    							.../*internalClasses*/ ctx[17]
    						})
    					},
    					dirty[0] & /*internalStyles, style*/ 262152 && {
    						style: Object.entries(/*internalStyles*/ ctx[18]).map(func$5).concat([/*style*/ ctx[3]]).join(' ')
    					},
    					dirty[0] & /*isUninitializedValue, pressed*/ 4194305 && {
    						"aria-pressed": !/*isUninitializedValue*/ ctx[22](/*pressed*/ ctx[0])
    						? /*pressed*/ ctx[0] ? 'true' : 'false'
    						: null
    					},
    					dirty[0] & /*pressed, ariaLabelOn, ariaLabelOff*/ 193 && {
    						"aria-label": /*pressed*/ ctx[0]
    						? /*ariaLabelOn*/ ctx[6]
    						: /*ariaLabelOff*/ ctx[7]
    					},
    					dirty[0] & /*ariaLabelOn*/ 64 && {
    						"data-aria-label-on": /*ariaLabelOn*/ ctx[6]
    					},
    					dirty[0] & /*ariaLabelOff*/ 128 && {
    						"data-aria-label-off": /*ariaLabelOff*/ ctx[7]
    					},
    					dirty[0] & /*ariaDescribedby*/ 16777216 && {
    						"aria-describedby": /*ariaDescribedby*/ ctx[24]
    					},
    					dirty[0] & /*href*/ 2048 && { href: /*href*/ ctx[11] },
    					dirty[0] & /*actionProp*/ 1048576 && get_spread_object(/*actionProp*/ ctx[20]),
    					dirty[0] & /*internalAttrs*/ 524288 && get_spread_object(/*internalAttrs*/ ctx[19]),
    					dirty[0] & /*$$restProps*/ 268435456 && get_spread_object(/*$$restProps*/ ctx[28])
    				])
    			: {};

    			if (dirty[0] & /*touch*/ 256 | dirty[1] & /*$$scope*/ 32) {
    				switch_instance_changes.$$scope = { dirty, ctx };
    			}

    			if (switch_value !== (switch_value = /*component*/ ctx[13])) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;

    					transition_out(old_component.$$.fragment, 1, 0, () => {
    						destroy_component(old_component, 1);
    					});

    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = new switch_value(switch_props(ctx));
    					/*switch_instance_binding*/ ctx[33](switch_instance);
    					switch_instance.$on("click", /*click_handler*/ ctx[34]);
    					switch_instance.$on("click", /*click_handler_1*/ ctx[35]);
    					create_component(switch_instance.$$.fragment);
    					transition_in(switch_instance.$$.fragment, 1);
    					mount_component(switch_instance, switch_instance_anchor.parentNode, switch_instance_anchor);
    				} else {
    					switch_instance = null;
    				}
    			} else if (switch_value) {
    				switch_instance.$set(switch_instance_changes);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			/*switch_instance_binding*/ ctx[33](null);
    			if (detaching) detach_dev(switch_instance_anchor);
    			if (switch_instance) destroy_component(switch_instance, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$g.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    const func$5 = ([name, value]) => `${name}: ${value};`;

    function instance_1$6($$self, $$props, $$invalidate) {
    	let actionProp;

    	const omit_props_names = [
    		"use","class","style","ripple","color","toggle","pressed","ariaLabelOn","ariaLabelOff","touch","displayFlex","size","href","action","component","getElement"
    	];

    	let $$restProps = compute_rest_props($$props, omit_props_names);
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('IconButton', slots, ['default']);
    	const forwardEvents = forwardEventsBuilder(get_current_component());

    	let uninitializedValue = () => {
    		
    	};

    	function isUninitializedValue(value) {
    		return value === uninitializedValue;
    	}

    	let { use = [] } = $$props;
    	let { class: className = '' } = $$props;
    	let { style = '' } = $$props;
    	let { ripple = true } = $$props;
    	let { color = undefined } = $$props;
    	let { toggle = false } = $$props;
    	let { pressed = uninitializedValue } = $$props;
    	let { ariaLabelOn = undefined } = $$props;
    	let { ariaLabelOff = undefined } = $$props;
    	let { touch = false } = $$props;
    	let { displayFlex = true } = $$props;
    	let { size = 'normal' } = $$props;
    	let { href = undefined } = $$props;
    	let { action = undefined } = $$props;
    	let element;
    	let instance;
    	let internalClasses = {};
    	let internalStyles = {};
    	let internalAttrs = {};
    	let context = getContext('SMUI:icon-button:context');
    	let ariaDescribedby = getContext('SMUI:icon-button:aria-describedby');
    	let { component = href == null ? Button : A } = $$props;
    	let previousDisabled = $$restProps.disabled;
    	setContext('SMUI:icon:context', 'icon-button');
    	let oldToggle = null;

    	onDestroy(() => {
    		instance && instance.destroy();
    	});

    	function hasClass(className) {
    		return className in internalClasses
    		? internalClasses[className]
    		: getElement().classList.contains(className);
    	}

    	function addClass(className) {
    		if (!internalClasses[className]) {
    			$$invalidate(17, internalClasses[className] = true, internalClasses);
    		}
    	}

    	function removeClass(className) {
    		if (!(className in internalClasses) || internalClasses[className]) {
    			$$invalidate(17, internalClasses[className] = false, internalClasses);
    		}
    	}

    	function addStyle(name, value) {
    		if (internalStyles[name] != value) {
    			if (value === '' || value == null) {
    				delete internalStyles[name];
    				$$invalidate(18, internalStyles);
    			} else {
    				$$invalidate(18, internalStyles[name] = value, internalStyles);
    			}
    		}
    	}

    	function getAttr(name) {
    		var _a;

    		return name in internalAttrs
    		? (_a = internalAttrs[name]) !== null && _a !== void 0
    			? _a
    			: null
    		: getElement().getAttribute(name);
    	}

    	function addAttr(name, value) {
    		if (internalAttrs[name] !== value) {
    			$$invalidate(19, internalAttrs[name] = value, internalAttrs);
    		}
    	}

    	function handleChange(evtData) {
    		$$invalidate(0, pressed = evtData.isOn);
    	}

    	function getElement() {
    		return element.getElement();
    	}

    	function switch_instance_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			element = $$value;
    			$$invalidate(15, element);
    		});
    	}

    	const click_handler = () => instance && instance.handleClick();
    	const click_handler_1 = () => context === 'top-app-bar:navigation' && dispatch(getElement(), 'SMUITopAppBarIconButton:nav');

    	$$self.$$set = $$new_props => {
    		$$props = assign(assign({}, $$props), exclude_internal_props($$new_props));
    		$$invalidate(28, $$restProps = compute_rest_props($$props, omit_props_names));
    		if ('use' in $$new_props) $$invalidate(1, use = $$new_props.use);
    		if ('class' in $$new_props) $$invalidate(2, className = $$new_props.class);
    		if ('style' in $$new_props) $$invalidate(3, style = $$new_props.style);
    		if ('ripple' in $$new_props) $$invalidate(4, ripple = $$new_props.ripple);
    		if ('color' in $$new_props) $$invalidate(5, color = $$new_props.color);
    		if ('toggle' in $$new_props) $$invalidate(29, toggle = $$new_props.toggle);
    		if ('pressed' in $$new_props) $$invalidate(0, pressed = $$new_props.pressed);
    		if ('ariaLabelOn' in $$new_props) $$invalidate(6, ariaLabelOn = $$new_props.ariaLabelOn);
    		if ('ariaLabelOff' in $$new_props) $$invalidate(7, ariaLabelOff = $$new_props.ariaLabelOff);
    		if ('touch' in $$new_props) $$invalidate(8, touch = $$new_props.touch);
    		if ('displayFlex' in $$new_props) $$invalidate(9, displayFlex = $$new_props.displayFlex);
    		if ('size' in $$new_props) $$invalidate(10, size = $$new_props.size);
    		if ('href' in $$new_props) $$invalidate(11, href = $$new_props.href);
    		if ('action' in $$new_props) $$invalidate(12, action = $$new_props.action);
    		if ('component' in $$new_props) $$invalidate(13, component = $$new_props.component);
    		if ('$$scope' in $$new_props) $$invalidate(36, $$scope = $$new_props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		MDCIconButtonToggleFoundation,
    		onDestroy,
    		getContext,
    		setContext,
    		get_current_component,
    		forwardEventsBuilder,
    		classMap,
    		dispatch,
    		Ripple,
    		A,
    		Button,
    		forwardEvents,
    		uninitializedValue,
    		isUninitializedValue,
    		use,
    		className,
    		style,
    		ripple,
    		color,
    		toggle,
    		pressed,
    		ariaLabelOn,
    		ariaLabelOff,
    		touch,
    		displayFlex,
    		size,
    		href,
    		action,
    		element,
    		instance,
    		internalClasses,
    		internalStyles,
    		internalAttrs,
    		context,
    		ariaDescribedby,
    		component,
    		previousDisabled,
    		oldToggle,
    		hasClass,
    		addClass,
    		removeClass,
    		addStyle,
    		getAttr,
    		addAttr,
    		handleChange,
    		getElement,
    		actionProp
    	});

    	$$self.$inject_state = $$new_props => {
    		if ('uninitializedValue' in $$props) uninitializedValue = $$new_props.uninitializedValue;
    		if ('use' in $$props) $$invalidate(1, use = $$new_props.use);
    		if ('className' in $$props) $$invalidate(2, className = $$new_props.className);
    		if ('style' in $$props) $$invalidate(3, style = $$new_props.style);
    		if ('ripple' in $$props) $$invalidate(4, ripple = $$new_props.ripple);
    		if ('color' in $$props) $$invalidate(5, color = $$new_props.color);
    		if ('toggle' in $$props) $$invalidate(29, toggle = $$new_props.toggle);
    		if ('pressed' in $$props) $$invalidate(0, pressed = $$new_props.pressed);
    		if ('ariaLabelOn' in $$props) $$invalidate(6, ariaLabelOn = $$new_props.ariaLabelOn);
    		if ('ariaLabelOff' in $$props) $$invalidate(7, ariaLabelOff = $$new_props.ariaLabelOff);
    		if ('touch' in $$props) $$invalidate(8, touch = $$new_props.touch);
    		if ('displayFlex' in $$props) $$invalidate(9, displayFlex = $$new_props.displayFlex);
    		if ('size' in $$props) $$invalidate(10, size = $$new_props.size);
    		if ('href' in $$props) $$invalidate(11, href = $$new_props.href);
    		if ('action' in $$props) $$invalidate(12, action = $$new_props.action);
    		if ('element' in $$props) $$invalidate(15, element = $$new_props.element);
    		if ('instance' in $$props) $$invalidate(16, instance = $$new_props.instance);
    		if ('internalClasses' in $$props) $$invalidate(17, internalClasses = $$new_props.internalClasses);
    		if ('internalStyles' in $$props) $$invalidate(18, internalStyles = $$new_props.internalStyles);
    		if ('internalAttrs' in $$props) $$invalidate(19, internalAttrs = $$new_props.internalAttrs);
    		if ('context' in $$props) $$invalidate(23, context = $$new_props.context);
    		if ('ariaDescribedby' in $$props) $$invalidate(24, ariaDescribedby = $$new_props.ariaDescribedby);
    		if ('component' in $$props) $$invalidate(13, component = $$new_props.component);
    		if ('previousDisabled' in $$props) $$invalidate(30, previousDisabled = $$new_props.previousDisabled);
    		if ('oldToggle' in $$props) $$invalidate(31, oldToggle = $$new_props.oldToggle);
    		if ('actionProp' in $$props) $$invalidate(20, actionProp = $$new_props.actionProp);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty[0] & /*action*/ 4096) {
    			$$invalidate(20, actionProp = (() => {
    				if (context === 'data-table:pagination') {
    					switch (action) {
    						case 'first-page':
    							return { 'data-first-page': 'true' };
    						case 'prev-page':
    							return { 'data-prev-page': 'true' };
    						case 'next-page':
    							return { 'data-next-page': 'true' };
    						case 'last-page':
    							return { 'data-last-page': 'true' };
    						default:
    							return { 'data-action': 'true' };
    					}
    				} else if (context === 'dialog:header') {
    					return { 'data-mdc-dialog-action': action };
    				} else {
    					return { action };
    				}
    			})());
    		}

    		if (previousDisabled !== $$restProps.disabled) {
    			const elem = getElement();

    			if ('blur' in elem) {
    				elem.blur();
    			}

    			$$invalidate(30, previousDisabled = $$restProps.disabled);
    		}

    		if ($$self.$$.dirty[0] & /*element, toggle, instance*/ 536969216 | $$self.$$.dirty[1] & /*oldToggle*/ 1) {
    			if (element && getElement() && toggle !== oldToggle) {
    				if (toggle && !instance) {
    					$$invalidate(16, instance = new MDCIconButtonToggleFoundation({
    							addClass,
    							hasClass,
    							notifyChange: evtData => {
    								handleChange(evtData);
    								dispatch(getElement(), 'SMUIIconButtonToggle:change', evtData, undefined, true);
    							},
    							removeClass,
    							getAttr,
    							setAttr: addAttr
    						}));

    					instance.init();
    				} else if (!toggle && instance) {
    					instance.destroy();
    					$$invalidate(16, instance = undefined);
    					$$invalidate(17, internalClasses = {});
    					$$invalidate(19, internalAttrs = {});
    				}

    				$$invalidate(31, oldToggle = toggle);
    			}
    		}

    		if ($$self.$$.dirty[0] & /*instance, pressed*/ 65537) {
    			if (instance && !isUninitializedValue(pressed) && instance.isOn() !== pressed) {
    				instance.toggle(pressed);
    			}
    		}
    	};

    	return [
    		pressed,
    		use,
    		className,
    		style,
    		ripple,
    		color,
    		ariaLabelOn,
    		ariaLabelOff,
    		touch,
    		displayFlex,
    		size,
    		href,
    		action,
    		component,
    		getElement,
    		element,
    		instance,
    		internalClasses,
    		internalStyles,
    		internalAttrs,
    		actionProp,
    		forwardEvents,
    		isUninitializedValue,
    		context,
    		ariaDescribedby,
    		addClass,
    		removeClass,
    		addStyle,
    		$$restProps,
    		toggle,
    		previousDisabled,
    		oldToggle,
    		slots,
    		switch_instance_binding,
    		click_handler,
    		click_handler_1,
    		$$scope
    	];
    }

    class IconButton extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(
    			this,
    			options,
    			instance_1$6,
    			create_fragment$g,
    			safe_not_equal,
    			{
    				use: 1,
    				class: 2,
    				style: 3,
    				ripple: 4,
    				color: 5,
    				toggle: 29,
    				pressed: 0,
    				ariaLabelOn: 6,
    				ariaLabelOff: 7,
    				touch: 8,
    				displayFlex: 9,
    				size: 10,
    				href: 11,
    				action: 12,
    				component: 13,
    				getElement: 14
    			},
    			null,
    			[-1, -1]
    		);

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "IconButton",
    			options,
    			id: create_fragment$g.name
    		});
    	}

    	get use() {
    		throw new Error("<IconButton>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set use(value) {
    		throw new Error("<IconButton>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get class() {
    		throw new Error("<IconButton>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set class(value) {
    		throw new Error("<IconButton>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get style() {
    		throw new Error("<IconButton>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set style(value) {
    		throw new Error("<IconButton>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get ripple() {
    		throw new Error("<IconButton>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set ripple(value) {
    		throw new Error("<IconButton>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get color() {
    		throw new Error("<IconButton>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set color(value) {
    		throw new Error("<IconButton>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get toggle() {
    		throw new Error("<IconButton>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set toggle(value) {
    		throw new Error("<IconButton>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get pressed() {
    		throw new Error("<IconButton>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set pressed(value) {
    		throw new Error("<IconButton>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get ariaLabelOn() {
    		throw new Error("<IconButton>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set ariaLabelOn(value) {
    		throw new Error("<IconButton>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get ariaLabelOff() {
    		throw new Error("<IconButton>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set ariaLabelOff(value) {
    		throw new Error("<IconButton>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get touch() {
    		throw new Error("<IconButton>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set touch(value) {
    		throw new Error("<IconButton>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get displayFlex() {
    		throw new Error("<IconButton>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set displayFlex(value) {
    		throw new Error("<IconButton>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get size() {
    		throw new Error("<IconButton>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set size(value) {
    		throw new Error("<IconButton>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get href() {
    		throw new Error("<IconButton>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set href(value) {
    		throw new Error("<IconButton>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get action() {
    		throw new Error("<IconButton>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set action(value) {
    		throw new Error("<IconButton>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get component() {
    		throw new Error("<IconButton>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set component(value) {
    		throw new Error("<IconButton>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get getElement() {
    		return this.$$.ctx[14];
    	}

    	set getElement(value) {
    		throw new Error("<IconButton>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules\@smui\common\dist\CommonLabel.svelte generated by Svelte v3.46.4 */

    // (1:0) <svelte:component   this={component}   bind:this={element}   use={[forwardEvents, ...use]}   class={classMap({     [className]: true,     'mdc-button__label': context === 'button',     'mdc-fab__label': context === 'fab',     'mdc-tab__text-label': context === 'tab',     'mdc-image-list__label': context === 'image-list',     'mdc-snackbar__label': context === 'snackbar',     'mdc-banner__text': context === 'banner',     'mdc-segmented-button__label': context === 'segmented-button',     'mdc-data-table__pagination-rows-per-page-label':       context === 'data-table:pagination',     'mdc-data-table__header-cell-label':       context === 'data-table:sortable-header-cell',   })}   {...context === 'snackbar' ? { 'aria-atomic': 'false' } : {}}   {tabindex}   {...$$restProps}>
    function create_default_slot$8(ctx) {
    	let current;
    	const default_slot_template = /*#slots*/ ctx[9].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[11], null);

    	const block = {
    		c: function create() {
    			if (default_slot) default_slot.c();
    		},
    		m: function mount(target, anchor) {
    			if (default_slot) {
    				default_slot.m(target, anchor);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 2048)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[11],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[11])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[11], dirty, null),
    						null
    					);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$8.name,
    		type: "slot",
    		source: "(1:0) <svelte:component   this={component}   bind:this={element}   use={[forwardEvents, ...use]}   class={classMap({     [className]: true,     'mdc-button__label': context === 'button',     'mdc-fab__label': context === 'fab',     'mdc-tab__text-label': context === 'tab',     'mdc-image-list__label': context === 'image-list',     'mdc-snackbar__label': context === 'snackbar',     'mdc-banner__text': context === 'banner',     'mdc-segmented-button__label': context === 'segmented-button',     'mdc-data-table__pagination-rows-per-page-label':       context === 'data-table:pagination',     'mdc-data-table__header-cell-label':       context === 'data-table:sortable-header-cell',   })}   {...context === 'snackbar' ? { 'aria-atomic': 'false' } : {}}   {tabindex}   {...$$restProps}>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$f(ctx) {
    	let switch_instance;
    	let switch_instance_anchor;
    	let current;

    	const switch_instance_spread_levels = [
    		{
    			use: [/*forwardEvents*/ ctx[4], .../*use*/ ctx[0]]
    		},
    		{
    			class: classMap({
    				[/*className*/ ctx[1]]: true,
    				'mdc-button__label': /*context*/ ctx[5] === 'button',
    				'mdc-fab__label': /*context*/ ctx[5] === 'fab',
    				'mdc-tab__text-label': /*context*/ ctx[5] === 'tab',
    				'mdc-image-list__label': /*context*/ ctx[5] === 'image-list',
    				'mdc-snackbar__label': /*context*/ ctx[5] === 'snackbar',
    				'mdc-banner__text': /*context*/ ctx[5] === 'banner',
    				'mdc-segmented-button__label': /*context*/ ctx[5] === 'segmented-button',
    				'mdc-data-table__pagination-rows-per-page-label': /*context*/ ctx[5] === 'data-table:pagination',
    				'mdc-data-table__header-cell-label': /*context*/ ctx[5] === 'data-table:sortable-header-cell'
    			})
    		},
    		/*context*/ ctx[5] === 'snackbar'
    		? { 'aria-atomic': 'false' }
    		: {},
    		{ tabindex: /*tabindex*/ ctx[6] },
    		/*$$restProps*/ ctx[7]
    	];

    	var switch_value = /*component*/ ctx[2];

    	function switch_props(ctx) {
    		let switch_instance_props = {
    			$$slots: { default: [create_default_slot$8] },
    			$$scope: { ctx }
    		};

    		for (let i = 0; i < switch_instance_spread_levels.length; i += 1) {
    			switch_instance_props = assign(switch_instance_props, switch_instance_spread_levels[i]);
    		}

    		return {
    			props: switch_instance_props,
    			$$inline: true
    		};
    	}

    	if (switch_value) {
    		switch_instance = new switch_value(switch_props(ctx));
    		/*switch_instance_binding*/ ctx[10](switch_instance);
    	}

    	const block = {
    		c: function create() {
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			switch_instance_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (switch_instance) {
    				mount_component(switch_instance, target, anchor);
    			}

    			insert_dev(target, switch_instance_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const switch_instance_changes = (dirty & /*forwardEvents, use, classMap, className, context, tabindex, $$restProps*/ 243)
    			? get_spread_update(switch_instance_spread_levels, [
    					dirty & /*forwardEvents, use*/ 17 && {
    						use: [/*forwardEvents*/ ctx[4], .../*use*/ ctx[0]]
    					},
    					dirty & /*classMap, className, context*/ 34 && {
    						class: classMap({
    							[/*className*/ ctx[1]]: true,
    							'mdc-button__label': /*context*/ ctx[5] === 'button',
    							'mdc-fab__label': /*context*/ ctx[5] === 'fab',
    							'mdc-tab__text-label': /*context*/ ctx[5] === 'tab',
    							'mdc-image-list__label': /*context*/ ctx[5] === 'image-list',
    							'mdc-snackbar__label': /*context*/ ctx[5] === 'snackbar',
    							'mdc-banner__text': /*context*/ ctx[5] === 'banner',
    							'mdc-segmented-button__label': /*context*/ ctx[5] === 'segmented-button',
    							'mdc-data-table__pagination-rows-per-page-label': /*context*/ ctx[5] === 'data-table:pagination',
    							'mdc-data-table__header-cell-label': /*context*/ ctx[5] === 'data-table:sortable-header-cell'
    						})
    					},
    					dirty & /*context*/ 32 && get_spread_object(/*context*/ ctx[5] === 'snackbar'
    					? { 'aria-atomic': 'false' }
    					: {}),
    					dirty & /*tabindex*/ 64 && { tabindex: /*tabindex*/ ctx[6] },
    					dirty & /*$$restProps*/ 128 && get_spread_object(/*$$restProps*/ ctx[7])
    				])
    			: {};

    			if (dirty & /*$$scope*/ 2048) {
    				switch_instance_changes.$$scope = { dirty, ctx };
    			}

    			if (switch_value !== (switch_value = /*component*/ ctx[2])) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;

    					transition_out(old_component.$$.fragment, 1, 0, () => {
    						destroy_component(old_component, 1);
    					});

    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = new switch_value(switch_props(ctx));
    					/*switch_instance_binding*/ ctx[10](switch_instance);
    					create_component(switch_instance.$$.fragment);
    					transition_in(switch_instance.$$.fragment, 1);
    					mount_component(switch_instance, switch_instance_anchor.parentNode, switch_instance_anchor);
    				} else {
    					switch_instance = null;
    				}
    			} else if (switch_value) {
    				switch_instance.$set(switch_instance_changes);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			/*switch_instance_binding*/ ctx[10](null);
    			if (detaching) detach_dev(switch_instance_anchor);
    			if (switch_instance) destroy_component(switch_instance, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$f.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$9($$self, $$props, $$invalidate) {
    	const omit_props_names = ["use","class","component","getElement"];
    	let $$restProps = compute_rest_props($$props, omit_props_names);
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('CommonLabel', slots, ['default']);
    	const forwardEvents = forwardEventsBuilder(get_current_component());
    	let { use = [] } = $$props;
    	let { class: className = '' } = $$props;
    	let element;
    	let { component = Span$1 } = $$props;
    	const context = getContext('SMUI:label:context');
    	const tabindex = getContext('SMUI:label:tabindex');

    	function getElement() {
    		return element.getElement();
    	}

    	function switch_instance_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			element = $$value;
    			$$invalidate(3, element);
    		});
    	}

    	$$self.$$set = $$new_props => {
    		$$props = assign(assign({}, $$props), exclude_internal_props($$new_props));
    		$$invalidate(7, $$restProps = compute_rest_props($$props, omit_props_names));
    		if ('use' in $$new_props) $$invalidate(0, use = $$new_props.use);
    		if ('class' in $$new_props) $$invalidate(1, className = $$new_props.class);
    		if ('component' in $$new_props) $$invalidate(2, component = $$new_props.component);
    		if ('$$scope' in $$new_props) $$invalidate(11, $$scope = $$new_props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		getContext,
    		get_current_component,
    		forwardEventsBuilder,
    		classMap,
    		Span: Span$1,
    		forwardEvents,
    		use,
    		className,
    		element,
    		component,
    		context,
    		tabindex,
    		getElement
    	});

    	$$self.$inject_state = $$new_props => {
    		if ('use' in $$props) $$invalidate(0, use = $$new_props.use);
    		if ('className' in $$props) $$invalidate(1, className = $$new_props.className);
    		if ('element' in $$props) $$invalidate(3, element = $$new_props.element);
    		if ('component' in $$props) $$invalidate(2, component = $$new_props.component);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		use,
    		className,
    		component,
    		element,
    		forwardEvents,
    		context,
    		tabindex,
    		$$restProps,
    		getElement,
    		slots,
    		switch_instance_binding,
    		$$scope
    	];
    }

    class CommonLabel extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$9, create_fragment$f, safe_not_equal, {
    			use: 0,
    			class: 1,
    			component: 2,
    			getElement: 8
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "CommonLabel",
    			options,
    			id: create_fragment$f.name
    		});
    	}

    	get use() {
    		throw new Error("<CommonLabel>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set use(value) {
    		throw new Error("<CommonLabel>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get class() {
    		throw new Error("<CommonLabel>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set class(value) {
    		throw new Error("<CommonLabel>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get component() {
    		throw new Error("<CommonLabel>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set component(value) {
    		throw new Error("<CommonLabel>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get getElement() {
    		return this.$$.ctx[8];
    	}

    	set getElement(value) {
    		throw new Error("<CommonLabel>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules\@smui\common\dist\ContextFragment.svelte generated by Svelte v3.46.4 */

    function create_fragment$e(ctx) {
    	let current;
    	const default_slot_template = /*#slots*/ ctx[4].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[3], null);

    	const block = {
    		c: function create() {
    			if (default_slot) default_slot.c();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (default_slot) {
    				default_slot.m(target, anchor);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 8)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[3],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[3])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[3], dirty, null),
    						null
    					);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$e.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$8($$self, $$props, $$invalidate) {
    	let $storeValue;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('ContextFragment', slots, ['default']);
    	let { key } = $$props;
    	let { value } = $$props;
    	const storeValue = writable(value);
    	validate_store(storeValue, 'storeValue');
    	component_subscribe($$self, storeValue, value => $$invalidate(5, $storeValue = value));
    	setContext(key, storeValue);

    	onDestroy(() => {
    		storeValue.set(undefined);
    	});

    	const writable_props = ['key', 'value'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<ContextFragment> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('key' in $$props) $$invalidate(1, key = $$props.key);
    		if ('value' in $$props) $$invalidate(2, value = $$props.value);
    		if ('$$scope' in $$props) $$invalidate(3, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		onDestroy,
    		setContext,
    		writable,
    		key,
    		value,
    		storeValue,
    		$storeValue
    	});

    	$$self.$inject_state = $$props => {
    		if ('key' in $$props) $$invalidate(1, key = $$props.key);
    		if ('value' in $$props) $$invalidate(2, value = $$props.value);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*value*/ 4) {
    			set_store_value(storeValue, $storeValue = value, $storeValue);
    		}
    	};

    	return [storeValue, key, value, $$scope, slots];
    }

    class ContextFragment extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$8, create_fragment$e, safe_not_equal, { key: 1, value: 2 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ContextFragment",
    			options,
    			id: create_fragment$e.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*key*/ ctx[1] === undefined && !('key' in props)) {
    			console.warn("<ContextFragment> was created without expected prop 'key'");
    		}

    		if (/*value*/ ctx[2] === undefined && !('value' in props)) {
    			console.warn("<ContextFragment> was created without expected prop 'value'");
    		}
    	}

    	get key() {
    		throw new Error("<ContextFragment>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set key(value) {
    		throw new Error("<ContextFragment>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get value() {
    		throw new Error("<ContextFragment>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set value(value) {
    		throw new Error("<ContextFragment>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    const Label = CommonLabel;

    /**
     * @license
     * Copyright 2020 Google Inc.
     *
     * Permission is hereby granted, free of charge, to any person obtaining a copy
     * of this software and associated documentation files (the "Software"), to deal
     * in the Software without restriction, including without limitation the rights
     * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
     * copies of the Software, and to permit persons to whom the Software is
     * furnished to do so, subject to the following conditions:
     *
     * The above copyright notice and this permission notice shall be included in
     * all copies or substantial portions of the Software.
     *
     * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
     * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
     * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
     * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
     * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
     * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
     * THE SOFTWARE.
     */
    /** Banner element classes. */
    var cssClasses$5 = {
        CLOSING: 'mdc-banner--closing',
        OPEN: 'mdc-banner--open',
        OPENING: 'mdc-banner--opening',
    };
    /** Banner numbers. */
    var numbers$3 = {
        BANNER_ANIMATION_CLOSE_TIME_MS: 250,
        BANNER_ANIMATION_OPEN_TIME_MS: 300,
    };
    /** Reason as to why the banner was closed. */
    var CloseReason;
    (function (CloseReason) {
        // Indicates the banner was closed via primary action button.
        CloseReason[CloseReason["PRIMARY"] = 0] = "PRIMARY";
        // Indicates the banner was closed via secondary action button.
        CloseReason[CloseReason["SECONDARY"] = 1] = "SECONDARY";
        // Will never be used by the component. Provided for custom handling of
        // programmatic closing of the banner.
        CloseReason[CloseReason["UNSPECIFIED"] = 2] = "UNSPECIFIED";
    })(CloseReason || (CloseReason = {}));

    /**
     * @license
     * Copyright 2020 Google Inc.
     *
     * Permission is hereby granted, free of charge, to any person obtaining a copy
     * of this software and associated documentation files (the "Software"), to deal
     * in the Software without restriction, including without limitation the rights
     * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
     * copies of the Software, and to permit persons to whom the Software is
     * furnished to do so, subject to the following conditions:
     *
     * The above copyright notice and this permission notice shall be included in
     * all copies or substantial portions of the Software.
     *
     * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
     * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
     * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
     * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
     * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
     * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
     * THE SOFTWARE.
     */
    var OPENING = cssClasses$5.OPENING, OPEN = cssClasses$5.OPEN, CLOSING = cssClasses$5.CLOSING;
    /**
     * Foundation class for banner. Responsibilities include opening and closing the
     * banner.
     */
    var MDCBannerFoundation = /** @class */ (function (_super) {
        __extends(MDCBannerFoundation, _super);
        function MDCBannerFoundation(adapter) {
            var _this = _super.call(this, __assign(__assign({}, MDCBannerFoundation.defaultAdapter), adapter)) || this;
            _this.isOpened = false;
            // Request id for open animation, used to cancel the refresh callback
            // request on close() and destroy().
            _this.animationFrame = 0;
            // Timer id for close and open animation, used to cancel the timer on
            // close() and destroy().
            _this.animationTimer = 0;
            return _this;
        }
        Object.defineProperty(MDCBannerFoundation, "defaultAdapter", {
            get: function () {
                return {
                    addClass: function () { return undefined; },
                    getContentHeight: function () { return 0; },
                    notifyClosed: function () { return undefined; },
                    notifyClosing: function () { return undefined; },
                    notifyOpened: function () { return undefined; },
                    notifyOpening: function () { return undefined; },
                    releaseFocus: function () { return undefined; },
                    removeClass: function () { return undefined; },
                    setStyleProperty: function () { return undefined; },
                    trapFocus: function () { return undefined; },
                };
            },
            enumerable: false,
            configurable: true
        });
        MDCBannerFoundation.prototype.destroy = function () {
            cancelAnimationFrame(this.animationFrame);
            this.animationFrame = 0;
            clearTimeout(this.animationTimer);
            this.animationTimer = 0;
        };
        MDCBannerFoundation.prototype.open = function () {
            var _this = this;
            this.isOpened = true;
            this.adapter.notifyOpening();
            this.adapter.removeClass(CLOSING);
            this.adapter.addClass(OPENING);
            var contentHeight = this.adapter.getContentHeight();
            this.animationFrame = requestAnimationFrame(function () {
                _this.adapter.addClass(OPEN);
                _this.adapter.setStyleProperty('height', contentHeight + "px");
                _this.animationTimer = setTimeout(function () {
                    _this.handleAnimationTimerEnd();
                    _this.adapter.trapFocus();
                    _this.adapter.notifyOpened();
                }, numbers$3.BANNER_ANIMATION_OPEN_TIME_MS);
            });
        };
        /**
         * @param reason Why the banner was closed. Value will be passed to
         *     events.CLOSING and events.CLOSED via the `event.detail.reason`
         *     property. Standard values are CloseReason.PRIMARY and
         *     CloseReason.SECONDARY, but CloseReason.UNSPECIFIED is provided for
         *     custom handling of programmatic closing of the banner.
         */
        MDCBannerFoundation.prototype.close = function (reason) {
            var _this = this;
            if (!this.isOpened) {
                // Avoid redundant close calls (and events), e.g. repeated interactions as
                // the banner is animating closed
                return;
            }
            cancelAnimationFrame(this.animationFrame);
            this.animationFrame = 0;
            this.isOpened = false;
            this.adapter.notifyClosing(reason);
            this.adapter.addClass(CLOSING);
            this.adapter.setStyleProperty('height', '0');
            this.adapter.removeClass(OPEN);
            this.adapter.removeClass(OPENING);
            clearTimeout(this.animationTimer);
            this.animationTimer = setTimeout(function () {
                _this.adapter.releaseFocus();
                _this.handleAnimationTimerEnd();
                _this.adapter.notifyClosed(reason);
            }, numbers$3.BANNER_ANIMATION_CLOSE_TIME_MS);
        };
        MDCBannerFoundation.prototype.isOpen = function () {
            return this.isOpened;
        };
        MDCBannerFoundation.prototype.handlePrimaryActionClick = function () {
            this.close(CloseReason.PRIMARY);
        };
        MDCBannerFoundation.prototype.handleSecondaryActionClick = function () {
            this.close(CloseReason.SECONDARY);
        };
        MDCBannerFoundation.prototype.layout = function () {
            var contentHeight = this.adapter.getContentHeight();
            this.adapter.setStyleProperty('height', contentHeight + "px");
        };
        MDCBannerFoundation.prototype.handleAnimationTimerEnd = function () {
            this.animationTimer = 0;
            this.adapter.removeClass(OPENING);
            this.adapter.removeClass(CLOSING);
        };
        return MDCBannerFoundation;
    }(MDCFoundation));

    /* node_modules\@smui\banner\dist\Fixed.svelte generated by Svelte v3.46.4 */
    const file$b = "node_modules\\@smui\\banner\\dist\\Fixed.svelte";

    // (10:0) {:else}
    function create_else_block$1(ctx) {
    	let current;
    	const default_slot_template = /*#slots*/ ctx[6].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[5], null);

    	const block = {
    		c: function create() {
    			if (default_slot) default_slot.c();
    		},
    		m: function mount(target, anchor) {
    			if (default_slot) {
    				default_slot.m(target, anchor);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 32)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[5],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[5])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[5], dirty, null),
    						null
    					);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$1.name,
    		type: "else",
    		source: "(10:0) {:else}",
    		ctx
    	});

    	return block;
    }

    // (1:0) {#if fixed}
    function create_if_block$6(ctx) {
    	let div;
    	let div_style_value;
    	let current;
    	let mounted;
    	let dispose;
    	const default_slot_template = /*#slots*/ ctx[6].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[5], null);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (default_slot) default_slot.c();
    			attr_dev(div, "class", "mdc-banner__fixed");

    			attr_dev(div, "style", div_style_value = /*width*/ ctx[1] == null
    			? undefined
    			: `width: ${/*width*/ ctx[1]}px;`);

    			add_location(div, file$b, 1, 2, 14);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (default_slot) {
    				default_slot.m(div, null);
    			}

    			/*div_binding*/ ctx[7](div);
    			current = true;

    			if (!mounted) {
    				dispose = action_destroyer(/*forwardEvents*/ ctx[3].call(null, div));
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 32)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[5],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[5])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[5], dirty, null),
    						null
    					);
    				}
    			}

    			if (!current || dirty & /*width*/ 2 && div_style_value !== (div_style_value = /*width*/ ctx[1] == null
    			? undefined
    			: `width: ${/*width*/ ctx[1]}px;`)) {
    				attr_dev(div, "style", div_style_value);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (default_slot) default_slot.d(detaching);
    			/*div_binding*/ ctx[7](null);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$6.name,
    		type: "if",
    		source: "(1:0) {#if fixed}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$d(ctx) {
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block$6, create_else_block$1];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*fixed*/ ctx[0]) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if_blocks[current_block_type_index].m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				} else {
    					if_block.p(ctx, dirty);
    				}

    				transition_in(if_block, 1);
    				if_block.m(if_block_anchor.parentNode, if_block_anchor);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if_blocks[current_block_type_index].d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$d.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$7($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Fixed', slots, ['default']);
    	const forwardEvents = forwardEventsBuilder(get_current_component());
    	let { fixed = false } = $$props;
    	let { width = undefined } = $$props;
    	let element;

    	function getElement() {
    		return element;
    	}

    	const writable_props = ['fixed', 'width'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Fixed> was created with unknown prop '${key}'`);
    	});

    	function div_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			element = $$value;
    			$$invalidate(2, element);
    		});
    	}

    	$$self.$$set = $$props => {
    		if ('fixed' in $$props) $$invalidate(0, fixed = $$props.fixed);
    		if ('width' in $$props) $$invalidate(1, width = $$props.width);
    		if ('$$scope' in $$props) $$invalidate(5, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		get_current_component,
    		forwardEventsBuilder,
    		forwardEvents,
    		fixed,
    		width,
    		element,
    		getElement
    	});

    	$$self.$inject_state = $$props => {
    		if ('fixed' in $$props) $$invalidate(0, fixed = $$props.fixed);
    		if ('width' in $$props) $$invalidate(1, width = $$props.width);
    		if ('element' in $$props) $$invalidate(2, element = $$props.element);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [fixed, width, element, forwardEvents, getElement, $$scope, slots, div_binding];
    }

    class Fixed extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$7, create_fragment$d, safe_not_equal, { fixed: 0, width: 1, getElement: 4 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Fixed",
    			options,
    			id: create_fragment$d.name
    		});
    	}

    	get fixed() {
    		throw new Error("<Fixed>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set fixed(value) {
    		throw new Error("<Fixed>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get width() {
    		throw new Error("<Fixed>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set width(value) {
    		throw new Error("<Fixed>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get getElement() {
    		return this.$$.ctx[4];
    	}

    	set getElement(value) {
    		throw new Error("<Fixed>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules\@smui\banner\dist\Banner.svelte generated by Svelte v3.46.4 */
    const file$a = "node_modules\\@smui\\banner\\dist\\Banner.svelte";
    const get_actions_slot_changes = dirty => ({});
    const get_actions_slot_context = ctx => ({});
    const get_label_slot_changes = dirty => ({});
    const get_label_slot_context = ctx => ({});
    const get_icon_slot_changes = dirty => ({});
    const get_icon_slot_context = ctx => ({});

    // (34:6) {#if $$slots.icon || $$slots.label}
    function create_if_block_1$3(ctx) {
    	let div;
    	let t;
    	let div_class_value;
    	let current;
    	let if_block = /*$$slots*/ ctx[19].icon && create_if_block_2$2(ctx);
    	const label_slot_template = /*#slots*/ ctx[26].label;
    	const label_slot = create_slot(label_slot_template, ctx, /*$$scope*/ ctx[30], get_label_slot_context);

    	let div_levels = [
    		{
    			class: div_class_value = classMap({
    				[/*textWrapper$class*/ ctx[7]]: true,
    				'mdc-banner__graphic-text-wrapper': true
    			})
    		},
    		prefixFilter(/*$$restProps*/ ctx[18], 'textWrapper$')
    	];

    	let div_data = {};

    	for (let i = 0; i < div_levels.length; i += 1) {
    		div_data = assign(div_data, div_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (if_block) if_block.c();
    			t = space();
    			if (label_slot) label_slot.c();
    			set_attributes(div, div_data);
    			add_location(div, file$a, 34, 8, 971);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			if (if_block) if_block.m(div, null);
    			append_dev(div, t);

    			if (label_slot) {
    				label_slot.m(div, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (/*$$slots*/ ctx[19].icon) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty[0] & /*$$slots*/ 524288) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block_2$2(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(div, t);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}

    			if (label_slot) {
    				if (label_slot.p && (!current || dirty[0] & /*$$scope*/ 1073741824)) {
    					update_slot_base(
    						label_slot,
    						label_slot_template,
    						ctx,
    						/*$$scope*/ ctx[30],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[30])
    						: get_slot_changes(label_slot_template, /*$$scope*/ ctx[30], dirty, get_label_slot_changes),
    						get_label_slot_context
    					);
    				}
    			}

    			set_attributes(div, div_data = get_spread_update(div_levels, [
    				(!current || dirty[0] & /*textWrapper$class*/ 128 && div_class_value !== (div_class_value = classMap({
    					[/*textWrapper$class*/ ctx[7]]: true,
    					'mdc-banner__graphic-text-wrapper': true
    				}))) && { class: div_class_value },
    				dirty[0] & /*$$restProps*/ 262144 && prefixFilter(/*$$restProps*/ ctx[18], 'textWrapper$')
    			]));
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			transition_in(label_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			transition_out(label_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (if_block) if_block.d();
    			if (label_slot) label_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$3.name,
    		type: "if",
    		source: "(34:6) {#if $$slots.icon || $$slots.label}",
    		ctx
    	});

    	return block;
    }

    // (42:10) {#if $$slots.icon}
    function create_if_block_2$2(ctx) {
    	let div;
    	let div_class_value;
    	let current;
    	const icon_slot_template = /*#slots*/ ctx[26].icon;
    	const icon_slot = create_slot(icon_slot_template, ctx, /*$$scope*/ ctx[30], get_icon_slot_context);

    	let div_levels = [
    		{
    			class: div_class_value = classMap({
    				[/*graphic$class*/ ctx[8]]: true,
    				'mdc-banner__graphic': true
    			})
    		},
    		{ role: "img" },
    		{ alt: "" },
    		prefixFilter(/*$$restProps*/ ctx[18], 'graphic$')
    	];

    	let div_data = {};

    	for (let i = 0; i < div_levels.length; i += 1) {
    		div_data = assign(div_data, div_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (icon_slot) icon_slot.c();
    			set_attributes(div, div_data);
    			add_location(div, file$a, 42, 12, 1219);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (icon_slot) {
    				icon_slot.m(div, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (icon_slot) {
    				if (icon_slot.p && (!current || dirty[0] & /*$$scope*/ 1073741824)) {
    					update_slot_base(
    						icon_slot,
    						icon_slot_template,
    						ctx,
    						/*$$scope*/ ctx[30],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[30])
    						: get_slot_changes(icon_slot_template, /*$$scope*/ ctx[30], dirty, get_icon_slot_changes),
    						get_icon_slot_context
    					);
    				}
    			}

    			set_attributes(div, div_data = get_spread_update(div_levels, [
    				(!current || dirty[0] & /*graphic$class*/ 256 && div_class_value !== (div_class_value = classMap({
    					[/*graphic$class*/ ctx[8]]: true,
    					'mdc-banner__graphic': true
    				}))) && { class: div_class_value },
    				{ role: "img" },
    				{ alt: "" },
    				dirty[0] & /*$$restProps*/ 262144 && prefixFilter(/*$$restProps*/ ctx[18], 'graphic$')
    			]));
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(icon_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(icon_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (icon_slot) icon_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2$2.name,
    		type: "if",
    		source: "(42:10) {#if $$slots.icon}",
    		ctx
    	});

    	return block;
    }

    // (58:6) {#if $$slots.actions}
    function create_if_block$5(ctx) {
    	let div;
    	let current;
    	const actions_slot_template = /*#slots*/ ctx[26].actions;
    	const actions_slot = create_slot(actions_slot_template, ctx, /*$$scope*/ ctx[30], get_actions_slot_context);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (actions_slot) actions_slot.c();
    			attr_dev(div, "class", "mdc-banner__actions");
    			add_location(div, file$a, 58, 8, 1640);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (actions_slot) {
    				actions_slot.m(div, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (actions_slot) {
    				if (actions_slot.p && (!current || dirty[0] & /*$$scope*/ 1073741824)) {
    					update_slot_base(
    						actions_slot,
    						actions_slot_template,
    						ctx,
    						/*$$scope*/ ctx[30],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[30])
    						: get_slot_changes(actions_slot_template, /*$$scope*/ ctx[30], dirty, get_actions_slot_changes),
    						get_actions_slot_context
    					);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(actions_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(actions_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (actions_slot) actions_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$5.name,
    		type: "if",
    		source: "(58:6) {#if $$slots.actions}",
    		ctx
    	});

    	return block;
    }

    // (23:2) <Fixed bind:fixed {width}>
    function create_default_slot$7(ctx) {
    	let div;
    	let t;
    	let div_class_value;
    	let current;
    	let if_block0 = (/*$$slots*/ ctx[19].icon || /*$$slots*/ ctx[19].label) && create_if_block_1$3(ctx);
    	let if_block1 = /*$$slots*/ ctx[19].actions && create_if_block$5(ctx);

    	let div_levels = [
    		{
    			class: div_class_value = classMap({
    				[/*content$class*/ ctx[6]]: true,
    				'mdc-banner__content': true
    			})
    		},
    		{ role: "alertdialog" },
    		{ "aria-live": "assertive" },
    		prefixFilter(/*$$restProps*/ ctx[18], 'content$')
    	];

    	let div_data = {};

    	for (let i = 0; i < div_levels.length; i += 1) {
    		div_data = assign(div_data, div_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (if_block0) if_block0.c();
    			t = space();
    			if (if_block1) if_block1.c();
    			set_attributes(div, div_data);
    			add_location(div, file$a, 23, 4, 680);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			if (if_block0) if_block0.m(div, null);
    			append_dev(div, t);
    			if (if_block1) if_block1.m(div, null);
    			/*div_binding*/ ctx[27](div);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (/*$$slots*/ ctx[19].icon || /*$$slots*/ ctx[19].label) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);

    					if (dirty[0] & /*$$slots*/ 524288) {
    						transition_in(if_block0, 1);
    					}
    				} else {
    					if_block0 = create_if_block_1$3(ctx);
    					if_block0.c();
    					transition_in(if_block0, 1);
    					if_block0.m(div, t);
    				}
    			} else if (if_block0) {
    				group_outros();

    				transition_out(if_block0, 1, 1, () => {
    					if_block0 = null;
    				});

    				check_outros();
    			}

    			if (/*$$slots*/ ctx[19].actions) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);

    					if (dirty[0] & /*$$slots*/ 524288) {
    						transition_in(if_block1, 1);
    					}
    				} else {
    					if_block1 = create_if_block$5(ctx);
    					if_block1.c();
    					transition_in(if_block1, 1);
    					if_block1.m(div, null);
    				}
    			} else if (if_block1) {
    				group_outros();

    				transition_out(if_block1, 1, 1, () => {
    					if_block1 = null;
    				});

    				check_outros();
    			}

    			set_attributes(div, div_data = get_spread_update(div_levels, [
    				(!current || dirty[0] & /*content$class*/ 64 && div_class_value !== (div_class_value = classMap({
    					[/*content$class*/ ctx[6]]: true,
    					'mdc-banner__content': true
    				}))) && { class: div_class_value },
    				{ role: "alertdialog" },
    				{ "aria-live": "assertive" },
    				dirty[0] & /*$$restProps*/ 262144 && prefixFilter(/*$$restProps*/ ctx[18], 'content$')
    			]));
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block0);
    			transition_in(if_block1);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block0);
    			transition_out(if_block1);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (if_block0) if_block0.d();
    			if (if_block1) if_block1.d();
    			/*div_binding*/ ctx[27](null);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$7.name,
    		type: "slot",
    		source: "(23:2) <Fixed bind:fixed {width}>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$c(ctx) {
    	let div;
    	let fixed_1;
    	let updating_fixed;
    	let div_class_value;
    	let div_style_value;
    	let useActions_action;
    	let current;
    	let mounted;
    	let dispose;

    	function fixed_1_fixed_binding(value) {
    		/*fixed_1_fixed_binding*/ ctx[28](value);
    	}

    	let fixed_1_props = {
    		width: /*width*/ ctx[14],
    		$$slots: { default: [create_default_slot$7] },
    		$$scope: { ctx }
    	};

    	if (/*fixed*/ ctx[0] !== void 0) {
    		fixed_1_props.fixed = /*fixed*/ ctx[0];
    	}

    	fixed_1 = new Fixed({ props: fixed_1_props, $$inline: true });
    	binding_callbacks.push(() => bind(fixed_1, 'fixed', fixed_1_fixed_binding));

    	let div_levels = [
    		{
    			class: div_class_value = classMap({
    				[/*className*/ ctx[2]]: true,
    				'mdc-banner': true,
    				'mdc-banner--centered': /*centered*/ ctx[4],
    				'mdc-banner--mobile-stacked': /*mobileStacked*/ ctx[5],
    				.../*internalClasses*/ ctx[11]
    			})
    		},
    		{
    			style: div_style_value = Object.entries(/*internalStyles*/ ctx[12]).map(func$4).concat([/*style*/ ctx[3]]).join(' ')
    		},
    		{ role: "banner" },
    		exclude(/*$$restProps*/ ctx[18], ['content$', 'textWrapper$', 'graphic$'])
    	];

    	let div_data = {};

    	for (let i = 0; i < div_levels.length; i += 1) {
    		div_data = assign(div_data, div_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(fixed_1.$$.fragment);
    			set_attributes(div, div_data);
    			add_location(div, file$a, 2, 0, 38);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(fixed_1, div, null);
    			/*div_binding_1*/ ctx[29](div);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(window, "resize", /*layout*/ ctx[9], false, false, false),
    					action_destroyer(useActions_action = useActions.call(null, div, /*use*/ ctx[1])),
    					action_destroyer(/*forwardEvents*/ ctx[15].call(null, div)),
    					listen_dev(div, "SMUIBannerButton:primaryActionClick", /*handlePrimaryActionClick*/ ctx[16], false, false, false),
    					listen_dev(div, "SMUIBannerButton:secondaryActionClick", /*handleSecondaryActionClick*/ ctx[17], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			const fixed_1_changes = {};
    			if (dirty[0] & /*width*/ 16384) fixed_1_changes.width = /*width*/ ctx[14];

    			if (dirty[0] & /*$$scope, content$class, $$restProps, content, $$slots, textWrapper$class, graphic$class*/ 1074536896) {
    				fixed_1_changes.$$scope = { dirty, ctx };
    			}

    			if (!updating_fixed && dirty[0] & /*fixed*/ 1) {
    				updating_fixed = true;
    				fixed_1_changes.fixed = /*fixed*/ ctx[0];
    				add_flush_callback(() => updating_fixed = false);
    			}

    			fixed_1.$set(fixed_1_changes);

    			set_attributes(div, div_data = get_spread_update(div_levels, [
    				(!current || dirty[0] & /*className, centered, mobileStacked, internalClasses*/ 2100 && div_class_value !== (div_class_value = classMap({
    					[/*className*/ ctx[2]]: true,
    					'mdc-banner': true,
    					'mdc-banner--centered': /*centered*/ ctx[4],
    					'mdc-banner--mobile-stacked': /*mobileStacked*/ ctx[5],
    					.../*internalClasses*/ ctx[11]
    				}))) && { class: div_class_value },
    				(!current || dirty[0] & /*internalStyles, style*/ 4104 && div_style_value !== (div_style_value = Object.entries(/*internalStyles*/ ctx[12]).map(func$4).concat([/*style*/ ctx[3]]).join(' '))) && { style: div_style_value },
    				{ role: "banner" },
    				dirty[0] & /*$$restProps*/ 262144 && exclude(/*$$restProps*/ ctx[18], ['content$', 'textWrapper$', 'graphic$'])
    			]));

    			if (useActions_action && is_function(useActions_action.update) && dirty[0] & /*use*/ 2) useActions_action.update.call(null, /*use*/ ctx[1]);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(fixed_1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(fixed_1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(fixed_1);
    			/*div_binding_1*/ ctx[29](null);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$c.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    const func$4 = ([name, value]) => `${name}: ${value};`;

    function instance_1$5($$self, $$props, $$invalidate) {
    	const omit_props_names = [
    		"use","class","style","open","centered","fixed","mobileStacked","content$class","textWrapper$class","graphic$class","isOpen","setOpen","layout","getElement"
    	];

    	let $$restProps = compute_rest_props($$props, omit_props_names);
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Banner', slots, ['icon','label','actions']);
    	const $$slots = compute_slots(slots);
    	const { FocusTrap } = domFocusTrap;
    	const forwardEvents = forwardEventsBuilder(get_current_component());
    	let { use = [] } = $$props;
    	let { class: className = '' } = $$props;
    	let { style = '' } = $$props;
    	let { open = false } = $$props;
    	let { centered = false } = $$props;
    	let { fixed = false } = $$props;
    	let { mobileStacked = false } = $$props;
    	let { content$class = '' } = $$props;
    	let { textWrapper$class = '' } = $$props;
    	let { graphic$class = '' } = $$props;
    	let element;
    	let instance;
    	let internalClasses = {};
    	let internalStyles = {};
    	let content;
    	let focusTrap;
    	let addLayoutListener = getContext('SMUI:addLayoutListener');
    	let removeLayoutListener;
    	let width = undefined;
    	setContext('SMUI:label:context', 'banner');
    	setContext('SMUI:icon:context', 'banner');
    	setContext('SMUI:button:context', 'banner');
    	let previousMobileStacked = mobileStacked;

    	if (addLayoutListener) {
    		removeLayoutListener = addLayoutListener(layout);
    	}

    	onMount(() => {
    		focusTrap = new FocusTrap(element, { initialFocusEl: getPrimaryActionEl() });

    		$$invalidate(24, instance = new MDCBannerFoundation({
    				addClass,
    				getContentHeight: () => {
    					let offsetHeight = content.offsetHeight;

    					if (offsetHeight === 0) {
    						getElement().classList.add('smui-banner--force-show');
    						offsetHeight = content.offsetHeight;
    						getElement().classList.remove('smui-banner--force-show');
    					}

    					return offsetHeight;
    				},
    				notifyClosed: reason => {
    					$$invalidate(20, open = false);
    					dispatch(getElement(), 'SMUIBanner:closed', { reason }, undefined, true);
    				},
    				notifyClosing: reason => {
    					dispatch(getElement(), 'SMUIBanner:closing', { reason }, undefined, true);
    				},
    				notifyOpened: () => {
    					$$invalidate(20, open = true);
    					dispatch(getElement(), 'SMUIBanner:opened', {}, undefined, true);
    				},
    				notifyOpening: () => {
    					dispatch(getElement(), 'SMUIBanner:opening', {}, undefined, true);
    				},
    				releaseFocus: () => focusTrap && focusTrap.releaseFocus(),
    				removeClass,
    				setStyleProperty: addStyle,
    				trapFocus: () => focusTrap && focusTrap.trapFocus()
    			}));

    		instance.init();
    		layout();

    		return () => {
    			instance.destroy();
    		};
    	});

    	onDestroy(() => {
    		if (removeLayoutListener) {
    			removeLayoutListener();
    		}
    	});

    	function addClass(className) {
    		if (!internalClasses[className]) {
    			$$invalidate(11, internalClasses[className] = true, internalClasses);
    		}
    	}

    	function removeClass(className) {
    		if (!(className in internalClasses) || internalClasses[className]) {
    			$$invalidate(11, internalClasses[className] = false, internalClasses);
    		}
    	}

    	function addStyle(name, value) {
    		if (internalStyles[name] != value) {
    			if (value === '' || value == null) {
    				delete internalStyles[name];
    				$$invalidate(12, internalStyles);
    			} else {
    				$$invalidate(12, internalStyles[name] = value, internalStyles);
    			}
    		}
    	}

    	function getPrimaryActionEl() {
    		var _a;

    		return (_a = element.querySelector('.mdc-banner__primary-action')) !== null && _a !== void 0
    		? _a
    		: undefined;
    	}

    	function handlePrimaryActionClick() {
    		instance.handlePrimaryActionClick();
    	}

    	function handleSecondaryActionClick() {
    		instance.handleSecondaryActionClick();
    	}

    	function isOpen() {
    		return open;
    	}

    	function setOpen(value) {
    		$$invalidate(20, open = value);
    	}

    	function layout() {
    		if (fixed) {
    			$$invalidate(14, width = element.offsetWidth);

    			if (width === 0) {
    				element.classList.add('smui-banner--force-show');
    				$$invalidate(14, width = element.offsetWidth);
    				element.classList.remove('smui-banner--force-show');
    			}
    		}

    		if (instance) {
    			instance.layout();
    		}
    	}

    	function getElement() {
    		return element;
    	}

    	function div_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			content = $$value;
    			$$invalidate(13, content);
    		});
    	}

    	function fixed_1_fixed_binding(value) {
    		fixed = value;
    		$$invalidate(0, fixed);
    	}

    	function div_binding_1($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			element = $$value;
    			$$invalidate(10, element);
    		});
    	}

    	$$self.$$set = $$new_props => {
    		$$props = assign(assign({}, $$props), exclude_internal_props($$new_props));
    		$$invalidate(18, $$restProps = compute_rest_props($$props, omit_props_names));
    		if ('use' in $$new_props) $$invalidate(1, use = $$new_props.use);
    		if ('class' in $$new_props) $$invalidate(2, className = $$new_props.class);
    		if ('style' in $$new_props) $$invalidate(3, style = $$new_props.style);
    		if ('open' in $$new_props) $$invalidate(20, open = $$new_props.open);
    		if ('centered' in $$new_props) $$invalidate(4, centered = $$new_props.centered);
    		if ('fixed' in $$new_props) $$invalidate(0, fixed = $$new_props.fixed);
    		if ('mobileStacked' in $$new_props) $$invalidate(5, mobileStacked = $$new_props.mobileStacked);
    		if ('content$class' in $$new_props) $$invalidate(6, content$class = $$new_props.content$class);
    		if ('textWrapper$class' in $$new_props) $$invalidate(7, textWrapper$class = $$new_props.textWrapper$class);
    		if ('graphic$class' in $$new_props) $$invalidate(8, graphic$class = $$new_props.graphic$class);
    		if ('$$scope' in $$new_props) $$invalidate(30, $$scope = $$new_props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		CloseReason,
    		MDCBannerFoundation,
    		domFocusTrap,
    		onMount,
    		onDestroy,
    		getContext,
    		setContext,
    		tick,
    		get_current_component,
    		forwardEventsBuilder,
    		classMap,
    		exclude,
    		prefixFilter,
    		useActions,
    		dispatch,
    		Fixed,
    		FocusTrap,
    		forwardEvents,
    		use,
    		className,
    		style,
    		open,
    		centered,
    		fixed,
    		mobileStacked,
    		content$class,
    		textWrapper$class,
    		graphic$class,
    		element,
    		instance,
    		internalClasses,
    		internalStyles,
    		content,
    		focusTrap,
    		addLayoutListener,
    		removeLayoutListener,
    		width,
    		previousMobileStacked,
    		addClass,
    		removeClass,
    		addStyle,
    		getPrimaryActionEl,
    		handlePrimaryActionClick,
    		handleSecondaryActionClick,
    		isOpen,
    		setOpen,
    		layout,
    		getElement
    	});

    	$$self.$inject_state = $$new_props => {
    		if ('use' in $$props) $$invalidate(1, use = $$new_props.use);
    		if ('className' in $$props) $$invalidate(2, className = $$new_props.className);
    		if ('style' in $$props) $$invalidate(3, style = $$new_props.style);
    		if ('open' in $$props) $$invalidate(20, open = $$new_props.open);
    		if ('centered' in $$props) $$invalidate(4, centered = $$new_props.centered);
    		if ('fixed' in $$props) $$invalidate(0, fixed = $$new_props.fixed);
    		if ('mobileStacked' in $$props) $$invalidate(5, mobileStacked = $$new_props.mobileStacked);
    		if ('content$class' in $$props) $$invalidate(6, content$class = $$new_props.content$class);
    		if ('textWrapper$class' in $$props) $$invalidate(7, textWrapper$class = $$new_props.textWrapper$class);
    		if ('graphic$class' in $$props) $$invalidate(8, graphic$class = $$new_props.graphic$class);
    		if ('element' in $$props) $$invalidate(10, element = $$new_props.element);
    		if ('instance' in $$props) $$invalidate(24, instance = $$new_props.instance);
    		if ('internalClasses' in $$props) $$invalidate(11, internalClasses = $$new_props.internalClasses);
    		if ('internalStyles' in $$props) $$invalidate(12, internalStyles = $$new_props.internalStyles);
    		if ('content' in $$props) $$invalidate(13, content = $$new_props.content);
    		if ('focusTrap' in $$props) focusTrap = $$new_props.focusTrap;
    		if ('addLayoutListener' in $$props) addLayoutListener = $$new_props.addLayoutListener;
    		if ('removeLayoutListener' in $$props) removeLayoutListener = $$new_props.removeLayoutListener;
    		if ('width' in $$props) $$invalidate(14, width = $$new_props.width);
    		if ('previousMobileStacked' in $$props) $$invalidate(25, previousMobileStacked = $$new_props.previousMobileStacked);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty[0] & /*instance, open*/ 17825792) {
    			if (instance && instance.isOpen() !== open) {
    				if (open) {
    					instance.open();
    				} else {
    					instance.close(CloseReason.UNSPECIFIED);
    				}
    			}
    		}

    		if ($$self.$$.dirty[0] & /*previousMobileStacked, mobileStacked*/ 33554464) {
    			if (previousMobileStacked !== mobileStacked) {
    				$$invalidate(25, previousMobileStacked = mobileStacked);
    				tick().then(layout);
    			}
    		}
    	};

    	return [
    		fixed,
    		use,
    		className,
    		style,
    		centered,
    		mobileStacked,
    		content$class,
    		textWrapper$class,
    		graphic$class,
    		layout,
    		element,
    		internalClasses,
    		internalStyles,
    		content,
    		width,
    		forwardEvents,
    		handlePrimaryActionClick,
    		handleSecondaryActionClick,
    		$$restProps,
    		$$slots,
    		open,
    		isOpen,
    		setOpen,
    		getElement,
    		instance,
    		previousMobileStacked,
    		slots,
    		div_binding,
    		fixed_1_fixed_binding,
    		div_binding_1,
    		$$scope
    	];
    }

    class Banner extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(
    			this,
    			options,
    			instance_1$5,
    			create_fragment$c,
    			safe_not_equal,
    			{
    				use: 1,
    				class: 2,
    				style: 3,
    				open: 20,
    				centered: 4,
    				fixed: 0,
    				mobileStacked: 5,
    				content$class: 6,
    				textWrapper$class: 7,
    				graphic$class: 8,
    				isOpen: 21,
    				setOpen: 22,
    				layout: 9,
    				getElement: 23
    			},
    			null,
    			[-1, -1]
    		);

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Banner",
    			options,
    			id: create_fragment$c.name
    		});
    	}

    	get use() {
    		throw new Error("<Banner>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set use(value) {
    		throw new Error("<Banner>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get class() {
    		throw new Error("<Banner>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set class(value) {
    		throw new Error("<Banner>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get style() {
    		throw new Error("<Banner>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set style(value) {
    		throw new Error("<Banner>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get open() {
    		throw new Error("<Banner>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set open(value) {
    		throw new Error("<Banner>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get centered() {
    		throw new Error("<Banner>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set centered(value) {
    		throw new Error("<Banner>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get fixed() {
    		throw new Error("<Banner>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set fixed(value) {
    		throw new Error("<Banner>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get mobileStacked() {
    		throw new Error("<Banner>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set mobileStacked(value) {
    		throw new Error("<Banner>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get content$class() {
    		throw new Error("<Banner>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set content$class(value) {
    		throw new Error("<Banner>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get textWrapper$class() {
    		throw new Error("<Banner>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set textWrapper$class(value) {
    		throw new Error("<Banner>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get graphic$class() {
    		throw new Error("<Banner>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set graphic$class(value) {
    		throw new Error("<Banner>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get isOpen() {
    		return this.$$.ctx[21];
    	}

    	set isOpen(value) {
    		throw new Error("<Banner>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get setOpen() {
    		return this.$$.ctx[22];
    	}

    	set setOpen(value) {
    		throw new Error("<Banner>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get layout() {
    		return this.$$.ctx[9];
    	}

    	set layout(value) {
    		throw new Error("<Banner>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get getElement() {
    		return this.$$.ctx[23];
    	}

    	set getElement(value) {
    		throw new Error("<Banner>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /**
     * @license
     * Copyright 2018 Google Inc.
     *
     * Permission is hereby granted, free of charge, to any person obtaining a copy
     * of this software and associated documentation files (the "Software"), to deal
     * in the Software without restriction, including without limitation the rights
     * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
     * copies of the Software, and to permit persons to whom the Software is
     * furnished to do so, subject to the following conditions:
     *
     * The above copyright notice and this permission notice shall be included in
     * all copies or substantial portions of the Software.
     *
     * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
     * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
     * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
     * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
     * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
     * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
     * THE SOFTWARE.
     */
    var cssClasses$4 = {
        ANCHOR: 'mdc-menu-surface--anchor',
        ANIMATING_CLOSED: 'mdc-menu-surface--animating-closed',
        ANIMATING_OPEN: 'mdc-menu-surface--animating-open',
        FIXED: 'mdc-menu-surface--fixed',
        IS_OPEN_BELOW: 'mdc-menu-surface--is-open-below',
        OPEN: 'mdc-menu-surface--open',
        ROOT: 'mdc-menu-surface',
    };
    // tslint:disable:object-literal-sort-keys
    var strings$2 = {
        CLOSED_EVENT: 'MDCMenuSurface:closed',
        CLOSING_EVENT: 'MDCMenuSurface:closing',
        OPENED_EVENT: 'MDCMenuSurface:opened',
        FOCUSABLE_ELEMENTS: [
            'button:not(:disabled)',
            '[href]:not([aria-disabled="true"])',
            'input:not(:disabled)',
            'select:not(:disabled)',
            'textarea:not(:disabled)',
            '[tabindex]:not([tabindex="-1"]):not([aria-disabled="true"])',
        ].join(', '),
    };
    // tslint:enable:object-literal-sort-keys
    var numbers$2 = {
        /** Total duration of menu-surface open animation. */
        TRANSITION_OPEN_DURATION: 120,
        /** Total duration of menu-surface close animation. */
        TRANSITION_CLOSE_DURATION: 75,
        /**
         * Margin left to the edge of the viewport when menu-surface is at maximum
         * possible height. Also used as a viewport margin.
         */
        MARGIN_TO_EDGE: 32,
        /**
         * Ratio of anchor width to menu-surface width for switching from corner
         * positioning to center positioning.
         */
        ANCHOR_TO_MENU_SURFACE_WIDTH_RATIO: 0.67,
        /**
         * Amount of time to wait before restoring focus when closing the menu
         * surface. This is important because if a touch event triggered the menu
         * close, and the subsequent mouse event occurs after focus is restored, then
         * the restored focus would be lost.
         */
        TOUCH_EVENT_WAIT_MS: 30,
    };
    /**
     * Enum for bits in the {@see Corner) bitmap.
     */
    var CornerBit;
    (function (CornerBit) {
        CornerBit[CornerBit["BOTTOM"] = 1] = "BOTTOM";
        CornerBit[CornerBit["CENTER"] = 2] = "CENTER";
        CornerBit[CornerBit["RIGHT"] = 4] = "RIGHT";
        CornerBit[CornerBit["FLIP_RTL"] = 8] = "FLIP_RTL";
    })(CornerBit || (CornerBit = {}));
    /**
     * Enum for representing an element corner for positioning the menu-surface.
     *
     * The START constants map to LEFT if element directionality is left
     * to right and RIGHT if the directionality is right to left.
     * Likewise END maps to RIGHT or LEFT depending on the directionality.
     */
    var Corner;
    (function (Corner) {
        Corner[Corner["TOP_LEFT"] = 0] = "TOP_LEFT";
        Corner[Corner["TOP_RIGHT"] = 4] = "TOP_RIGHT";
        Corner[Corner["BOTTOM_LEFT"] = 1] = "BOTTOM_LEFT";
        Corner[Corner["BOTTOM_RIGHT"] = 5] = "BOTTOM_RIGHT";
        Corner[Corner["TOP_START"] = 8] = "TOP_START";
        Corner[Corner["TOP_END"] = 12] = "TOP_END";
        Corner[Corner["BOTTOM_START"] = 9] = "BOTTOM_START";
        Corner[Corner["BOTTOM_END"] = 13] = "BOTTOM_END";
    })(Corner || (Corner = {}));

    /**
     * @license
     * Copyright 2018 Google Inc.
     *
     * Permission is hereby granted, free of charge, to any person obtaining a copy
     * of this software and associated documentation files (the "Software"), to deal
     * in the Software without restriction, including without limitation the rights
     * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
     * copies of the Software, and to permit persons to whom the Software is
     * furnished to do so, subject to the following conditions:
     *
     * The above copyright notice and this permission notice shall be included in
     * all copies or substantial portions of the Software.
     *
     * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
     * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
     * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
     * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
     * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
     * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
     * THE SOFTWARE.
     */
    var _a, _b;
    var cssClasses$3 = {
        LIST_ITEM_ACTIVATED_CLASS: 'mdc-list-item--activated',
        LIST_ITEM_CLASS: 'mdc-list-item',
        LIST_ITEM_DISABLED_CLASS: 'mdc-list-item--disabled',
        LIST_ITEM_SELECTED_CLASS: 'mdc-list-item--selected',
        LIST_ITEM_TEXT_CLASS: 'mdc-list-item__text',
        LIST_ITEM_PRIMARY_TEXT_CLASS: 'mdc-list-item__primary-text',
        ROOT: 'mdc-list',
    };
    (_a = {},
        _a["" + cssClasses$3.LIST_ITEM_ACTIVATED_CLASS] = 'mdc-list-item--activated',
        _a["" + cssClasses$3.LIST_ITEM_CLASS] = 'mdc-list-item',
        _a["" + cssClasses$3.LIST_ITEM_DISABLED_CLASS] = 'mdc-list-item--disabled',
        _a["" + cssClasses$3.LIST_ITEM_SELECTED_CLASS] = 'mdc-list-item--selected',
        _a["" + cssClasses$3.LIST_ITEM_PRIMARY_TEXT_CLASS] = 'mdc-list-item__primary-text',
        _a["" + cssClasses$3.ROOT] = 'mdc-list',
        _a);
    var deprecatedClassNameMap = (_b = {},
        _b["" + cssClasses$3.LIST_ITEM_ACTIVATED_CLASS] = 'mdc-deprecated-list-item--activated',
        _b["" + cssClasses$3.LIST_ITEM_CLASS] = 'mdc-deprecated-list-item',
        _b["" + cssClasses$3.LIST_ITEM_DISABLED_CLASS] = 'mdc-deprecated-list-item--disabled',
        _b["" + cssClasses$3.LIST_ITEM_SELECTED_CLASS] = 'mdc-deprecated-list-item--selected',
        _b["" + cssClasses$3.LIST_ITEM_TEXT_CLASS] = 'mdc-deprecated-list-item__text',
        _b["" + cssClasses$3.LIST_ITEM_PRIMARY_TEXT_CLASS] = 'mdc-deprecated-list-item__primary-text',
        _b["" + cssClasses$3.ROOT] = 'mdc-deprecated-list',
        _b);
    var strings$1 = {
        ACTION_EVENT: 'MDCList:action',
        ARIA_CHECKED: 'aria-checked',
        ARIA_CHECKED_CHECKBOX_SELECTOR: '[role="checkbox"][aria-checked="true"]',
        ARIA_CHECKED_RADIO_SELECTOR: '[role="radio"][aria-checked="true"]',
        ARIA_CURRENT: 'aria-current',
        ARIA_DISABLED: 'aria-disabled',
        ARIA_ORIENTATION: 'aria-orientation',
        ARIA_ORIENTATION_HORIZONTAL: 'horizontal',
        ARIA_ROLE_CHECKBOX_SELECTOR: '[role="checkbox"]',
        ARIA_SELECTED: 'aria-selected',
        ARIA_INTERACTIVE_ROLES_SELECTOR: '[role="listbox"], [role="menu"]',
        ARIA_MULTI_SELECTABLE_SELECTOR: '[aria-multiselectable="true"]',
        CHECKBOX_RADIO_SELECTOR: 'input[type="checkbox"], input[type="radio"]',
        CHECKBOX_SELECTOR: 'input[type="checkbox"]',
        CHILD_ELEMENTS_TO_TOGGLE_TABINDEX: "\n    ." + cssClasses$3.LIST_ITEM_CLASS + " button:not(:disabled),\n    ." + cssClasses$3.LIST_ITEM_CLASS + " a,\n    ." + deprecatedClassNameMap[cssClasses$3.LIST_ITEM_CLASS] + " button:not(:disabled),\n    ." + deprecatedClassNameMap[cssClasses$3.LIST_ITEM_CLASS] + " a\n  ",
        DEPRECATED_SELECTOR: '.mdc-deprecated-list',
        FOCUSABLE_CHILD_ELEMENTS: "\n    ." + cssClasses$3.LIST_ITEM_CLASS + " button:not(:disabled),\n    ." + cssClasses$3.LIST_ITEM_CLASS + " a,\n    ." + cssClasses$3.LIST_ITEM_CLASS + " input[type=\"radio\"]:not(:disabled),\n    ." + cssClasses$3.LIST_ITEM_CLASS + " input[type=\"checkbox\"]:not(:disabled),\n    ." + deprecatedClassNameMap[cssClasses$3.LIST_ITEM_CLASS] + " button:not(:disabled),\n    ." + deprecatedClassNameMap[cssClasses$3.LIST_ITEM_CLASS] + " a,\n    ." + deprecatedClassNameMap[cssClasses$3.LIST_ITEM_CLASS] + " input[type=\"radio\"]:not(:disabled),\n    ." + deprecatedClassNameMap[cssClasses$3.LIST_ITEM_CLASS] + " input[type=\"checkbox\"]:not(:disabled)\n  ",
        RADIO_SELECTOR: 'input[type="radio"]',
        SELECTED_ITEM_SELECTOR: '[aria-selected="true"], [aria-current="true"]',
    };
    var numbers$1 = {
        UNSET_INDEX: -1,
        TYPEAHEAD_BUFFER_CLEAR_TIMEOUT_MS: 300
    };

    /**
     * @license
     * Copyright 2020 Google Inc.
     *
     * Permission is hereby granted, free of charge, to any person obtaining a copy
     * of this software and associated documentation files (the "Software"), to deal
     * in the Software without restriction, including without limitation the rights
     * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
     * copies of the Software, and to permit persons to whom the Software is
     * furnished to do so, subject to the following conditions:
     *
     * The above copyright notice and this permission notice shall be included in
     * all copies or substantial portions of the Software.
     *
     * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
     * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
     * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
     * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
     * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
     * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
     * THE SOFTWARE.
     */
    var ELEMENTS_KEY_ALLOWED_IN = ['input', 'button', 'textarea', 'select'];
    /**
     * Ensures that preventDefault is only called if the containing element
     * doesn't consume the event, and it will cause an unintended scroll.
     *
     * @param evt keyboard event to be prevented.
     */
    var preventDefaultEvent = function (evt) {
        var target = evt.target;
        if (!target) {
            return;
        }
        var tagName = ("" + target.tagName).toLowerCase();
        if (ELEMENTS_KEY_ALLOWED_IN.indexOf(tagName) === -1) {
            evt.preventDefault();
        }
    };

    /**
     * @license
     * Copyright 2020 Google Inc.
     *
     * Permission is hereby granted, free of charge, to any person obtaining a copy
     * of this software and associated documentation files (the "Software"), to deal
     * in the Software without restriction, including without limitation the rights
     * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
     * copies of the Software, and to permit persons to whom the Software is
     * furnished to do so, subject to the following conditions:
     *
     * The above copyright notice and this permission notice shall be included in
     * all copies or substantial portions of the Software.
     *
     * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
     * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
     * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
     * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
     * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
     * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
     * THE SOFTWARE.
     */
    /**
     * Initializes a state object for typeahead. Use the same reference for calls to
     * typeahead functions.
     *
     * @return The current state of the typeahead process. Each state reference
     *     represents a typeahead instance as the reference is typically mutated
     *     in-place.
     */
    function initState() {
        var state = {
            bufferClearTimeout: 0,
            currentFirstChar: '',
            sortedIndexCursor: 0,
            typeaheadBuffer: '',
        };
        return state;
    }
    /**
     * Initializes typeahead state by indexing the current list items by primary
     * text into the sortedIndexByFirstChar data structure.
     *
     * @param listItemCount numer of items in the list
     * @param getPrimaryTextByItemIndex function that returns the primary text at a
     *     given index
     *
     * @return Map that maps the first character of the primary text to the full
     *     list text and it's index
     */
    function initSortedIndex(listItemCount, getPrimaryTextByItemIndex) {
        var sortedIndexByFirstChar = new Map();
        // Aggregate item text to index mapping
        for (var i = 0; i < listItemCount; i++) {
            var primaryText = getPrimaryTextByItemIndex(i).trim();
            if (!primaryText) {
                continue;
            }
            var firstChar = primaryText[0].toLowerCase();
            if (!sortedIndexByFirstChar.has(firstChar)) {
                sortedIndexByFirstChar.set(firstChar, []);
            }
            sortedIndexByFirstChar.get(firstChar).push({ text: primaryText.toLowerCase(), index: i });
        }
        // Sort the mapping
        // TODO(b/157162694): Investigate replacing forEach with Map.values()
        sortedIndexByFirstChar.forEach(function (values) {
            values.sort(function (first, second) {
                return first.index - second.index;
            });
        });
        return sortedIndexByFirstChar;
    }
    /**
     * Given the next desired character from the user, it attempts to find the next
     * list option matching the buffer. Wraps around if at the end of options.
     *
     * @param opts Options and accessors
     *   - nextChar - the next character to match against items
     *   - sortedIndexByFirstChar - output of `initSortedIndex(...)`
     *   - focusedItemIndex - the index of the currently focused item
     *   - focusItemAtIndex - function that focuses a list item at given index
     *   - skipFocus - whether or not to focus the matched item
     *   - isItemAtIndexDisabled - function that determines whether an item at a
     *        given index is disabled
     * @param state The typeahead state instance. See `initState`.
     *
     * @return The index of the matched item, or -1 if no match.
     */
    function matchItem(opts, state) {
        var nextChar = opts.nextChar, focusItemAtIndex = opts.focusItemAtIndex, sortedIndexByFirstChar = opts.sortedIndexByFirstChar, focusedItemIndex = opts.focusedItemIndex, skipFocus = opts.skipFocus, isItemAtIndexDisabled = opts.isItemAtIndexDisabled;
        clearTimeout(state.bufferClearTimeout);
        state.bufferClearTimeout = setTimeout(function () {
            clearBuffer(state);
        }, numbers$1.TYPEAHEAD_BUFFER_CLEAR_TIMEOUT_MS);
        state.typeaheadBuffer = state.typeaheadBuffer + nextChar;
        var index;
        if (state.typeaheadBuffer.length === 1) {
            index = matchFirstChar(sortedIndexByFirstChar, focusedItemIndex, isItemAtIndexDisabled, state);
        }
        else {
            index = matchAllChars(sortedIndexByFirstChar, isItemAtIndexDisabled, state);
        }
        if (index !== -1 && !skipFocus) {
            focusItemAtIndex(index);
        }
        return index;
    }
    /**
     * Matches the user's single input character in the buffer to the
     * next option that begins with such character. Wraps around if at
     * end of options. Returns -1 if no match is found.
     */
    function matchFirstChar(sortedIndexByFirstChar, focusedItemIndex, isItemAtIndexDisabled, state) {
        var firstChar = state.typeaheadBuffer[0];
        var itemsMatchingFirstChar = sortedIndexByFirstChar.get(firstChar);
        if (!itemsMatchingFirstChar) {
            return -1;
        }
        // Has the same firstChar been recently matched?
        // Also, did starting index remain the same between key presses?
        // If both hold true, simply increment index.
        if (firstChar === state.currentFirstChar &&
            itemsMatchingFirstChar[state.sortedIndexCursor].index ===
                focusedItemIndex) {
            state.sortedIndexCursor =
                (state.sortedIndexCursor + 1) % itemsMatchingFirstChar.length;
            var newIndex = itemsMatchingFirstChar[state.sortedIndexCursor].index;
            if (!isItemAtIndexDisabled(newIndex)) {
                return newIndex;
            }
        }
        // If we're here, it means one of the following happened:
        // - either firstChar or startingIndex has changed, invalidating the
        // cursor.
        // - The next item of typeahead is disabled, so we have to look further.
        state.currentFirstChar = firstChar;
        var newCursorPosition = -1;
        var cursorPosition;
        // Find the first non-disabled item as a fallback.
        for (cursorPosition = 0; cursorPosition < itemsMatchingFirstChar.length; cursorPosition++) {
            if (!isItemAtIndexDisabled(itemsMatchingFirstChar[cursorPosition].index)) {
                newCursorPosition = cursorPosition;
                break;
            }
        }
        // Advance cursor to first item matching the firstChar that is positioned
        // after starting item. Cursor is unchanged from fallback if there's no
        // such item.
        for (; cursorPosition < itemsMatchingFirstChar.length; cursorPosition++) {
            if (itemsMatchingFirstChar[cursorPosition].index > focusedItemIndex &&
                !isItemAtIndexDisabled(itemsMatchingFirstChar[cursorPosition].index)) {
                newCursorPosition = cursorPosition;
                break;
            }
        }
        if (newCursorPosition !== -1) {
            state.sortedIndexCursor = newCursorPosition;
            return itemsMatchingFirstChar[state.sortedIndexCursor].index;
        }
        return -1;
    }
    /**
     * Attempts to find the next item that matches all of the typeahead buffer.
     * Wraps around if at end of options. Returns -1 if no match is found.
     */
    function matchAllChars(sortedIndexByFirstChar, isItemAtIndexDisabled, state) {
        var firstChar = state.typeaheadBuffer[0];
        var itemsMatchingFirstChar = sortedIndexByFirstChar.get(firstChar);
        if (!itemsMatchingFirstChar) {
            return -1;
        }
        // Do nothing if text already matches
        var startingItem = itemsMatchingFirstChar[state.sortedIndexCursor];
        if (startingItem.text.lastIndexOf(state.typeaheadBuffer, 0) === 0 &&
            !isItemAtIndexDisabled(startingItem.index)) {
            return startingItem.index;
        }
        // Find next item that matches completely; if no match, we'll eventually
        // loop around to same position
        var cursorPosition = (state.sortedIndexCursor + 1) % itemsMatchingFirstChar.length;
        var nextCursorPosition = -1;
        while (cursorPosition !== state.sortedIndexCursor) {
            var currentItem = itemsMatchingFirstChar[cursorPosition];
            var matches = currentItem.text.lastIndexOf(state.typeaheadBuffer, 0) === 0;
            var isEnabled = !isItemAtIndexDisabled(currentItem.index);
            if (matches && isEnabled) {
                nextCursorPosition = cursorPosition;
                break;
            }
            cursorPosition = (cursorPosition + 1) % itemsMatchingFirstChar.length;
        }
        if (nextCursorPosition !== -1) {
            state.sortedIndexCursor = nextCursorPosition;
            return itemsMatchingFirstChar[state.sortedIndexCursor].index;
        }
        return -1;
    }
    /**
     * Whether or not the given typeahead instaance state is currently typing.
     *
     * @param state The typeahead state instance. See `initState`.
     */
    function isTypingInProgress(state) {
        return state.typeaheadBuffer.length > 0;
    }
    /**
     * Clears the typeahaed buffer so that it resets item matching to the first
     * character.
     *
     * @param state The typeahead state instance. See `initState`.
     */
    function clearBuffer(state) {
        state.typeaheadBuffer = '';
    }
    /**
     * Given a keydown event, it calculates whether or not to automatically focus a
     * list item depending on what was typed mimicing the typeahead functionality of
     * a standard <select> element that is open.
     *
     * @param opts Options and accessors
     *   - event - the KeyboardEvent to handle and parse
     *   - sortedIndexByFirstChar - output of `initSortedIndex(...)`
     *   - focusedItemIndex - the index of the currently focused item
     *   - focusItemAtIndex - function that focuses a list item at given index
     *   - isItemAtFocusedIndexDisabled - whether or not the currently focused item
     *      is disabled
     *   - isTargetListItem - whether or not the event target is a list item
     * @param state The typeahead state instance. See `initState`.
     *
     * @returns index of the item matched by the keydown. -1 if not matched.
     */
    function handleKeydown(opts, state) {
        var event = opts.event, isTargetListItem = opts.isTargetListItem, focusedItemIndex = opts.focusedItemIndex, focusItemAtIndex = opts.focusItemAtIndex, sortedIndexByFirstChar = opts.sortedIndexByFirstChar, isItemAtIndexDisabled = opts.isItemAtIndexDisabled;
        var isArrowLeft = normalizeKey(event) === 'ArrowLeft';
        var isArrowUp = normalizeKey(event) === 'ArrowUp';
        var isArrowRight = normalizeKey(event) === 'ArrowRight';
        var isArrowDown = normalizeKey(event) === 'ArrowDown';
        var isHome = normalizeKey(event) === 'Home';
        var isEnd = normalizeKey(event) === 'End';
        var isEnter = normalizeKey(event) === 'Enter';
        var isSpace = normalizeKey(event) === 'Spacebar';
        if (event.ctrlKey || event.metaKey || isArrowLeft || isArrowUp ||
            isArrowRight || isArrowDown || isHome || isEnd || isEnter) {
            return -1;
        }
        var isCharacterKey = !isSpace && event.key.length === 1;
        if (isCharacterKey) {
            preventDefaultEvent(event);
            var matchItemOpts = {
                focusItemAtIndex: focusItemAtIndex,
                focusedItemIndex: focusedItemIndex,
                nextChar: event.key.toLowerCase(),
                sortedIndexByFirstChar: sortedIndexByFirstChar,
                skipFocus: false,
                isItemAtIndexDisabled: isItemAtIndexDisabled,
            };
            return matchItem(matchItemOpts, state);
        }
        if (!isSpace) {
            return -1;
        }
        if (isTargetListItem) {
            preventDefaultEvent(event);
        }
        var typeaheadOnListItem = isTargetListItem && isTypingInProgress(state);
        if (typeaheadOnListItem) {
            var matchItemOpts = {
                focusItemAtIndex: focusItemAtIndex,
                focusedItemIndex: focusedItemIndex,
                nextChar: ' ',
                sortedIndexByFirstChar: sortedIndexByFirstChar,
                skipFocus: false,
                isItemAtIndexDisabled: isItemAtIndexDisabled,
            };
            // space participates in typeahead matching if in rapid typing mode
            return matchItem(matchItemOpts, state);
        }
        return -1;
    }

    /**
     * @license
     * Copyright 2018 Google Inc.
     *
     * Permission is hereby granted, free of charge, to any person obtaining a copy
     * of this software and associated documentation files (the "Software"), to deal
     * in the Software without restriction, including without limitation the rights
     * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
     * copies of the Software, and to permit persons to whom the Software is
     * furnished to do so, subject to the following conditions:
     *
     * The above copyright notice and this permission notice shall be included in
     * all copies or substantial portions of the Software.
     *
     * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
     * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
     * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
     * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
     * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
     * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
     * THE SOFTWARE.
     */
    function isNumberArray(selectedIndex) {
        return selectedIndex instanceof Array;
    }
    var MDCListFoundation = /** @class */ (function (_super) {
        __extends(MDCListFoundation, _super);
        function MDCListFoundation(adapter) {
            var _this = _super.call(this, __assign(__assign({}, MDCListFoundation.defaultAdapter), adapter)) || this;
            _this.wrapFocus = false;
            _this.isVertical = true;
            _this.isSingleSelectionList = false;
            _this.selectedIndex = numbers$1.UNSET_INDEX;
            _this.focusedItemIndex = numbers$1.UNSET_INDEX;
            _this.useActivatedClass = false;
            _this.useSelectedAttr = false;
            _this.ariaCurrentAttrValue = null;
            _this.isCheckboxList = false;
            _this.isRadioList = false;
            _this.hasTypeahead = false;
            // Transiently holds current typeahead prefix from user.
            _this.typeaheadState = initState();
            _this.sortedIndexByFirstChar = new Map();
            return _this;
        }
        Object.defineProperty(MDCListFoundation, "strings", {
            get: function () {
                return strings$1;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(MDCListFoundation, "cssClasses", {
            get: function () {
                return cssClasses$3;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(MDCListFoundation, "numbers", {
            get: function () {
                return numbers$1;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(MDCListFoundation, "defaultAdapter", {
            get: function () {
                return {
                    addClassForElementIndex: function () { return undefined; },
                    focusItemAtIndex: function () { return undefined; },
                    getAttributeForElementIndex: function () { return null; },
                    getFocusedElementIndex: function () { return 0; },
                    getListItemCount: function () { return 0; },
                    hasCheckboxAtIndex: function () { return false; },
                    hasRadioAtIndex: function () { return false; },
                    isCheckboxCheckedAtIndex: function () { return false; },
                    isFocusInsideList: function () { return false; },
                    isRootFocused: function () { return false; },
                    listItemAtIndexHasClass: function () { return false; },
                    notifyAction: function () { return undefined; },
                    removeClassForElementIndex: function () { return undefined; },
                    setAttributeForElementIndex: function () { return undefined; },
                    setCheckedCheckboxOrRadioAtIndex: function () { return undefined; },
                    setTabIndexForListItemChildren: function () { return undefined; },
                    getPrimaryTextAtIndex: function () { return ''; },
                };
            },
            enumerable: false,
            configurable: true
        });
        MDCListFoundation.prototype.layout = function () {
            if (this.adapter.getListItemCount() === 0) {
                return;
            }
            // TODO(b/172274142): consider all items when determining the list's type.
            if (this.adapter.hasCheckboxAtIndex(0)) {
                this.isCheckboxList = true;
            }
            else if (this.adapter.hasRadioAtIndex(0)) {
                this.isRadioList = true;
            }
            else {
                this.maybeInitializeSingleSelection();
            }
            if (this.hasTypeahead) {
                this.sortedIndexByFirstChar = this.typeaheadInitSortedIndex();
            }
        };
        /** Returns the index of the item that was last focused. */
        MDCListFoundation.prototype.getFocusedItemIndex = function () {
            return this.focusedItemIndex;
        };
        /** Toggles focus wrapping with keyboard navigation. */
        MDCListFoundation.prototype.setWrapFocus = function (value) {
            this.wrapFocus = value;
        };
        /**
         * Toggles orientation direction for keyboard navigation (true for vertical,
         * false for horizontal).
         */
        MDCListFoundation.prototype.setVerticalOrientation = function (value) {
            this.isVertical = value;
        };
        /** Toggles single-selection behavior. */
        MDCListFoundation.prototype.setSingleSelection = function (value) {
            this.isSingleSelectionList = value;
            if (value) {
                this.maybeInitializeSingleSelection();
                this.selectedIndex = this.getSelectedIndexFromDOM();
            }
        };
        /**
         * Automatically determines whether the list is single selection list. If so,
         * initializes the internal state to match the selected item.
         */
        MDCListFoundation.prototype.maybeInitializeSingleSelection = function () {
            var selectedItemIndex = this.getSelectedIndexFromDOM();
            if (selectedItemIndex === numbers$1.UNSET_INDEX)
                return;
            var hasActivatedClass = this.adapter.listItemAtIndexHasClass(selectedItemIndex, cssClasses$3.LIST_ITEM_ACTIVATED_CLASS);
            if (hasActivatedClass) {
                this.setUseActivatedClass(true);
            }
            this.isSingleSelectionList = true;
            this.selectedIndex = selectedItemIndex;
        };
        /** @return Index of the first selected item based on the DOM state. */
        MDCListFoundation.prototype.getSelectedIndexFromDOM = function () {
            var selectedIndex = numbers$1.UNSET_INDEX;
            var listItemsCount = this.adapter.getListItemCount();
            for (var i = 0; i < listItemsCount; i++) {
                var hasSelectedClass = this.adapter.listItemAtIndexHasClass(i, cssClasses$3.LIST_ITEM_SELECTED_CLASS);
                var hasActivatedClass = this.adapter.listItemAtIndexHasClass(i, cssClasses$3.LIST_ITEM_ACTIVATED_CLASS);
                if (!(hasSelectedClass || hasActivatedClass)) {
                    continue;
                }
                selectedIndex = i;
                break;
            }
            return selectedIndex;
        };
        /**
         * Sets whether typeahead is enabled on the list.
         * @param hasTypeahead Whether typeahead is enabled.
         */
        MDCListFoundation.prototype.setHasTypeahead = function (hasTypeahead) {
            this.hasTypeahead = hasTypeahead;
            if (hasTypeahead) {
                this.sortedIndexByFirstChar = this.typeaheadInitSortedIndex();
            }
        };
        /**
         * @return Whether typeahead is currently matching a user-specified prefix.
         */
        MDCListFoundation.prototype.isTypeaheadInProgress = function () {
            return this.hasTypeahead &&
                isTypingInProgress(this.typeaheadState);
        };
        /** Toggle use of the "activated" CSS class. */
        MDCListFoundation.prototype.setUseActivatedClass = function (useActivated) {
            this.useActivatedClass = useActivated;
        };
        /**
         * Toggles use of the selected attribute (true for aria-selected, false for
         * aria-checked).
         */
        MDCListFoundation.prototype.setUseSelectedAttribute = function (useSelected) {
            this.useSelectedAttr = useSelected;
        };
        MDCListFoundation.prototype.getSelectedIndex = function () {
            return this.selectedIndex;
        };
        MDCListFoundation.prototype.setSelectedIndex = function (index, _a) {
            var _b = _a === void 0 ? {} : _a, forceUpdate = _b.forceUpdate;
            if (!this.isIndexValid(index)) {
                return;
            }
            if (this.isCheckboxList) {
                this.setCheckboxAtIndex(index);
            }
            else if (this.isRadioList) {
                this.setRadioAtIndex(index);
            }
            else {
                this.setSingleSelectionAtIndex(index, { forceUpdate: forceUpdate });
            }
        };
        /**
         * Focus in handler for the list items.
         */
        MDCListFoundation.prototype.handleFocusIn = function (listItemIndex) {
            if (listItemIndex >= 0) {
                this.focusedItemIndex = listItemIndex;
                this.adapter.setAttributeForElementIndex(listItemIndex, 'tabindex', '0');
                this.adapter.setTabIndexForListItemChildren(listItemIndex, '0');
            }
        };
        /**
         * Focus out handler for the list items.
         */
        MDCListFoundation.prototype.handleFocusOut = function (listItemIndex) {
            var _this = this;
            if (listItemIndex >= 0) {
                this.adapter.setAttributeForElementIndex(listItemIndex, 'tabindex', '-1');
                this.adapter.setTabIndexForListItemChildren(listItemIndex, '-1');
            }
            /**
             * Between Focusout & Focusin some browsers do not have focus on any
             * element. Setting a delay to wait till the focus is moved to next element.
             */
            setTimeout(function () {
                if (!_this.adapter.isFocusInsideList()) {
                    _this.setTabindexToFirstSelectedOrFocusedItem();
                }
            }, 0);
        };
        /**
         * Key handler for the list.
         */
        MDCListFoundation.prototype.handleKeydown = function (event, isRootListItem, listItemIndex) {
            var _this = this;
            var isArrowLeft = normalizeKey(event) === 'ArrowLeft';
            var isArrowUp = normalizeKey(event) === 'ArrowUp';
            var isArrowRight = normalizeKey(event) === 'ArrowRight';
            var isArrowDown = normalizeKey(event) === 'ArrowDown';
            var isHome = normalizeKey(event) === 'Home';
            var isEnd = normalizeKey(event) === 'End';
            var isEnter = normalizeKey(event) === 'Enter';
            var isSpace = normalizeKey(event) === 'Spacebar';
            // Have to check both upper and lower case, because having caps lock on
            // affects the value.
            var isLetterA = event.key === 'A' || event.key === 'a';
            if (this.adapter.isRootFocused()) {
                if (isArrowUp || isEnd) {
                    event.preventDefault();
                    this.focusLastElement();
                }
                else if (isArrowDown || isHome) {
                    event.preventDefault();
                    this.focusFirstElement();
                }
                if (this.hasTypeahead) {
                    var handleKeydownOpts = {
                        event: event,
                        focusItemAtIndex: function (index) {
                            _this.focusItemAtIndex(index);
                        },
                        focusedItemIndex: -1,
                        isTargetListItem: isRootListItem,
                        sortedIndexByFirstChar: this.sortedIndexByFirstChar,
                        isItemAtIndexDisabled: function (index) {
                            return _this.adapter.listItemAtIndexHasClass(index, cssClasses$3.LIST_ITEM_DISABLED_CLASS);
                        },
                    };
                    handleKeydown(handleKeydownOpts, this.typeaheadState);
                }
                return;
            }
            var currentIndex = this.adapter.getFocusedElementIndex();
            if (currentIndex === -1) {
                currentIndex = listItemIndex;
                if (currentIndex < 0) {
                    // If this event doesn't have a mdc-list-item ancestor from the
                    // current list (not from a sublist), return early.
                    return;
                }
            }
            if ((this.isVertical && isArrowDown) ||
                (!this.isVertical && isArrowRight)) {
                preventDefaultEvent(event);
                this.focusNextElement(currentIndex);
            }
            else if ((this.isVertical && isArrowUp) || (!this.isVertical && isArrowLeft)) {
                preventDefaultEvent(event);
                this.focusPrevElement(currentIndex);
            }
            else if (isHome) {
                preventDefaultEvent(event);
                this.focusFirstElement();
            }
            else if (isEnd) {
                preventDefaultEvent(event);
                this.focusLastElement();
            }
            else if (isLetterA && event.ctrlKey && this.isCheckboxList) {
                event.preventDefault();
                this.toggleAll(this.selectedIndex === numbers$1.UNSET_INDEX ?
                    [] :
                    this.selectedIndex);
            }
            else if (isEnter || isSpace) {
                if (isRootListItem) {
                    // Return early if enter key is pressed on anchor element which triggers
                    // synthetic MouseEvent event.
                    var target = event.target;
                    if (target && target.tagName === 'A' && isEnter) {
                        return;
                    }
                    preventDefaultEvent(event);
                    if (this.adapter.listItemAtIndexHasClass(currentIndex, cssClasses$3.LIST_ITEM_DISABLED_CLASS)) {
                        return;
                    }
                    if (!this.isTypeaheadInProgress()) {
                        if (this.isSelectableList()) {
                            this.setSelectedIndexOnAction(currentIndex);
                        }
                        this.adapter.notifyAction(currentIndex);
                    }
                }
            }
            if (this.hasTypeahead) {
                var handleKeydownOpts = {
                    event: event,
                    focusItemAtIndex: function (index) {
                        _this.focusItemAtIndex(index);
                    },
                    focusedItemIndex: this.focusedItemIndex,
                    isTargetListItem: isRootListItem,
                    sortedIndexByFirstChar: this.sortedIndexByFirstChar,
                    isItemAtIndexDisabled: function (index) { return _this.adapter.listItemAtIndexHasClass(index, cssClasses$3.LIST_ITEM_DISABLED_CLASS); },
                };
                handleKeydown(handleKeydownOpts, this.typeaheadState);
            }
        };
        /**
         * Click handler for the list.
         */
        MDCListFoundation.prototype.handleClick = function (index, toggleCheckbox) {
            if (index === numbers$1.UNSET_INDEX) {
                return;
            }
            if (this.adapter.listItemAtIndexHasClass(index, cssClasses$3.LIST_ITEM_DISABLED_CLASS)) {
                return;
            }
            if (this.isSelectableList()) {
                this.setSelectedIndexOnAction(index, toggleCheckbox);
            }
            this.adapter.notifyAction(index);
        };
        /**
         * Focuses the next element on the list.
         */
        MDCListFoundation.prototype.focusNextElement = function (index) {
            var count = this.adapter.getListItemCount();
            var nextIndex = index + 1;
            if (nextIndex >= count) {
                if (this.wrapFocus) {
                    nextIndex = 0;
                }
                else {
                    // Return early because last item is already focused.
                    return index;
                }
            }
            this.focusItemAtIndex(nextIndex);
            return nextIndex;
        };
        /**
         * Focuses the previous element on the list.
         */
        MDCListFoundation.prototype.focusPrevElement = function (index) {
            var prevIndex = index - 1;
            if (prevIndex < 0) {
                if (this.wrapFocus) {
                    prevIndex = this.adapter.getListItemCount() - 1;
                }
                else {
                    // Return early because first item is already focused.
                    return index;
                }
            }
            this.focusItemAtIndex(prevIndex);
            return prevIndex;
        };
        MDCListFoundation.prototype.focusFirstElement = function () {
            this.focusItemAtIndex(0);
            return 0;
        };
        MDCListFoundation.prototype.focusLastElement = function () {
            var lastIndex = this.adapter.getListItemCount() - 1;
            this.focusItemAtIndex(lastIndex);
            return lastIndex;
        };
        MDCListFoundation.prototype.focusInitialElement = function () {
            var initialIndex = this.getFirstSelectedOrFocusedItemIndex();
            this.focusItemAtIndex(initialIndex);
            return initialIndex;
        };
        /**
         * @param itemIndex Index of the list item
         * @param isEnabled Sets the list item to enabled or disabled.
         */
        MDCListFoundation.prototype.setEnabled = function (itemIndex, isEnabled) {
            if (!this.isIndexValid(itemIndex)) {
                return;
            }
            if (isEnabled) {
                this.adapter.removeClassForElementIndex(itemIndex, cssClasses$3.LIST_ITEM_DISABLED_CLASS);
                this.adapter.setAttributeForElementIndex(itemIndex, strings$1.ARIA_DISABLED, 'false');
            }
            else {
                this.adapter.addClassForElementIndex(itemIndex, cssClasses$3.LIST_ITEM_DISABLED_CLASS);
                this.adapter.setAttributeForElementIndex(itemIndex, strings$1.ARIA_DISABLED, 'true');
            }
        };
        MDCListFoundation.prototype.setSingleSelectionAtIndex = function (index, _a) {
            var _b = _a === void 0 ? {} : _a, forceUpdate = _b.forceUpdate;
            if (this.selectedIndex === index && !forceUpdate) {
                return;
            }
            var selectedClassName = cssClasses$3.LIST_ITEM_SELECTED_CLASS;
            if (this.useActivatedClass) {
                selectedClassName = cssClasses$3.LIST_ITEM_ACTIVATED_CLASS;
            }
            if (this.selectedIndex !== numbers$1.UNSET_INDEX) {
                this.adapter.removeClassForElementIndex(this.selectedIndex, selectedClassName);
            }
            this.setAriaForSingleSelectionAtIndex(index);
            this.setTabindexAtIndex(index);
            if (index !== numbers$1.UNSET_INDEX) {
                this.adapter.addClassForElementIndex(index, selectedClassName);
            }
            this.selectedIndex = index;
        };
        /**
         * Sets aria attribute for single selection at given index.
         */
        MDCListFoundation.prototype.setAriaForSingleSelectionAtIndex = function (index) {
            // Detect the presence of aria-current and get the value only during list
            // initialization when it is in unset state.
            if (this.selectedIndex === numbers$1.UNSET_INDEX) {
                this.ariaCurrentAttrValue =
                    this.adapter.getAttributeForElementIndex(index, strings$1.ARIA_CURRENT);
            }
            var isAriaCurrent = this.ariaCurrentAttrValue !== null;
            var ariaAttribute = isAriaCurrent ? strings$1.ARIA_CURRENT : strings$1.ARIA_SELECTED;
            if (this.selectedIndex !== numbers$1.UNSET_INDEX) {
                this.adapter.setAttributeForElementIndex(this.selectedIndex, ariaAttribute, 'false');
            }
            if (index !== numbers$1.UNSET_INDEX) {
                var ariaAttributeValue = isAriaCurrent ? this.ariaCurrentAttrValue : 'true';
                this.adapter.setAttributeForElementIndex(index, ariaAttribute, ariaAttributeValue);
            }
        };
        /**
         * Returns the attribute to use for indicating selection status.
         */
        MDCListFoundation.prototype.getSelectionAttribute = function () {
            return this.useSelectedAttr ? strings$1.ARIA_SELECTED : strings$1.ARIA_CHECKED;
        };
        /**
         * Toggles radio at give index. Radio doesn't change the checked state if it
         * is already checked.
         */
        MDCListFoundation.prototype.setRadioAtIndex = function (index) {
            var selectionAttribute = this.getSelectionAttribute();
            this.adapter.setCheckedCheckboxOrRadioAtIndex(index, true);
            if (this.selectedIndex !== numbers$1.UNSET_INDEX) {
                this.adapter.setAttributeForElementIndex(this.selectedIndex, selectionAttribute, 'false');
            }
            this.adapter.setAttributeForElementIndex(index, selectionAttribute, 'true');
            this.selectedIndex = index;
        };
        MDCListFoundation.prototype.setCheckboxAtIndex = function (index) {
            var selectionAttribute = this.getSelectionAttribute();
            for (var i = 0; i < this.adapter.getListItemCount(); i++) {
                var isChecked = false;
                if (index.indexOf(i) >= 0) {
                    isChecked = true;
                }
                this.adapter.setCheckedCheckboxOrRadioAtIndex(i, isChecked);
                this.adapter.setAttributeForElementIndex(i, selectionAttribute, isChecked ? 'true' : 'false');
            }
            this.selectedIndex = index;
        };
        MDCListFoundation.prototype.setTabindexAtIndex = function (index) {
            if (this.focusedItemIndex === numbers$1.UNSET_INDEX && index !== 0) {
                // If some list item was selected set first list item's tabindex to -1.
                // Generally, tabindex is set to 0 on first list item of list that has no
                // preselected items.
                this.adapter.setAttributeForElementIndex(0, 'tabindex', '-1');
            }
            else if (this.focusedItemIndex >= 0 && this.focusedItemIndex !== index) {
                this.adapter.setAttributeForElementIndex(this.focusedItemIndex, 'tabindex', '-1');
            }
            // Set the previous selection's tabindex to -1. We need this because
            // in selection menus that are not visible, programmatically setting an
            // option will not change focus but will change where tabindex should be 0.
            if (!(this.selectedIndex instanceof Array) &&
                this.selectedIndex !== index) {
                this.adapter.setAttributeForElementIndex(this.selectedIndex, 'tabindex', '-1');
            }
            if (index !== numbers$1.UNSET_INDEX) {
                this.adapter.setAttributeForElementIndex(index, 'tabindex', '0');
            }
        };
        /**
         * @return Return true if it is single selectin list, checkbox list or radio
         *     list.
         */
        MDCListFoundation.prototype.isSelectableList = function () {
            return this.isSingleSelectionList || this.isCheckboxList ||
                this.isRadioList;
        };
        MDCListFoundation.prototype.setTabindexToFirstSelectedOrFocusedItem = function () {
            var targetIndex = this.getFirstSelectedOrFocusedItemIndex();
            this.setTabindexAtIndex(targetIndex);
        };
        MDCListFoundation.prototype.getFirstSelectedOrFocusedItemIndex = function () {
            // Action lists retain focus on the most recently focused item.
            if (!this.isSelectableList()) {
                return Math.max(this.focusedItemIndex, 0);
            }
            // Single-selection lists focus the selected item.
            if (typeof this.selectedIndex === 'number' &&
                this.selectedIndex !== numbers$1.UNSET_INDEX) {
                return this.selectedIndex;
            }
            // Multiple-selection lists focus the first selected item.
            if (isNumberArray(this.selectedIndex) && this.selectedIndex.length > 0) {
                return this.selectedIndex.reduce(function (minIndex, currentIndex) { return Math.min(minIndex, currentIndex); });
            }
            // Selection lists without a selection focus the first item.
            return 0;
        };
        MDCListFoundation.prototype.isIndexValid = function (index) {
            var _this = this;
            if (index instanceof Array) {
                if (!this.isCheckboxList) {
                    throw new Error('MDCListFoundation: Array of index is only supported for checkbox based list');
                }
                if (index.length === 0) {
                    return true;
                }
                else {
                    return index.some(function (i) { return _this.isIndexInRange(i); });
                }
            }
            else if (typeof index === 'number') {
                if (this.isCheckboxList) {
                    throw new Error("MDCListFoundation: Expected array of index for checkbox based list but got number: " + index);
                }
                return this.isIndexInRange(index) ||
                    this.isSingleSelectionList && index === numbers$1.UNSET_INDEX;
            }
            else {
                return false;
            }
        };
        MDCListFoundation.prototype.isIndexInRange = function (index) {
            var listSize = this.adapter.getListItemCount();
            return index >= 0 && index < listSize;
        };
        /**
         * Sets selected index on user action, toggles checkbox / radio based on
         * toggleCheckbox value. User interaction should not toggle list item(s) when
         * disabled.
         */
        MDCListFoundation.prototype.setSelectedIndexOnAction = function (index, toggleCheckbox) {
            if (toggleCheckbox === void 0) { toggleCheckbox = true; }
            if (this.isCheckboxList) {
                this.toggleCheckboxAtIndex(index, toggleCheckbox);
            }
            else {
                this.setSelectedIndex(index);
            }
        };
        MDCListFoundation.prototype.toggleCheckboxAtIndex = function (index, toggleCheckbox) {
            var selectionAttribute = this.getSelectionAttribute();
            var isChecked = this.adapter.isCheckboxCheckedAtIndex(index);
            if (toggleCheckbox) {
                isChecked = !isChecked;
                this.adapter.setCheckedCheckboxOrRadioAtIndex(index, isChecked);
            }
            this.adapter.setAttributeForElementIndex(index, selectionAttribute, isChecked ? 'true' : 'false');
            // If none of the checkbox items are selected and selectedIndex is not
            // initialized then provide a default value.
            var selectedIndexes = this.selectedIndex === numbers$1.UNSET_INDEX ?
                [] :
                this.selectedIndex.slice();
            if (isChecked) {
                selectedIndexes.push(index);
            }
            else {
                selectedIndexes = selectedIndexes.filter(function (i) { return i !== index; });
            }
            this.selectedIndex = selectedIndexes;
        };
        MDCListFoundation.prototype.focusItemAtIndex = function (index) {
            this.adapter.focusItemAtIndex(index);
            this.focusedItemIndex = index;
        };
        MDCListFoundation.prototype.toggleAll = function (currentlySelectedIndexes) {
            var count = this.adapter.getListItemCount();
            // If all items are selected, deselect everything.
            if (currentlySelectedIndexes.length === count) {
                this.setCheckboxAtIndex([]);
            }
            else {
                // Otherwise select all enabled options.
                var allIndexes = [];
                for (var i = 0; i < count; i++) {
                    if (!this.adapter.listItemAtIndexHasClass(i, cssClasses$3.LIST_ITEM_DISABLED_CLASS) ||
                        currentlySelectedIndexes.indexOf(i) > -1) {
                        allIndexes.push(i);
                    }
                }
                this.setCheckboxAtIndex(allIndexes);
            }
        };
        /**
         * Given the next desired character from the user, adds it to the typeahead
         * buffer. Then, attempts to find the next option matching the buffer. Wraps
         * around if at the end of options.
         *
         * @param nextChar The next character to add to the prefix buffer.
         * @param startingIndex The index from which to start matching. Only relevant
         *     when starting a new match sequence. To start a new match sequence,
         *     clear the buffer using `clearTypeaheadBuffer`, or wait for the buffer
         *     to clear after a set interval defined in list foundation. Defaults to
         *     the currently focused index.
         * @return The index of the matched item, or -1 if no match.
         */
        MDCListFoundation.prototype.typeaheadMatchItem = function (nextChar, startingIndex, skipFocus) {
            var _this = this;
            if (skipFocus === void 0) { skipFocus = false; }
            var opts = {
                focusItemAtIndex: function (index) {
                    _this.focusItemAtIndex(index);
                },
                focusedItemIndex: startingIndex ? startingIndex : this.focusedItemIndex,
                nextChar: nextChar,
                sortedIndexByFirstChar: this.sortedIndexByFirstChar,
                skipFocus: skipFocus,
                isItemAtIndexDisabled: function (index) { return _this.adapter.listItemAtIndexHasClass(index, cssClasses$3.LIST_ITEM_DISABLED_CLASS); }
            };
            return matchItem(opts, this.typeaheadState);
        };
        /**
         * Initializes the MDCListTextAndIndex data structure by indexing the current
         * list items by primary text.
         *
         * @return The primary texts of all the list items sorted by first character.
         */
        MDCListFoundation.prototype.typeaheadInitSortedIndex = function () {
            return initSortedIndex(this.adapter.getListItemCount(), this.adapter.getPrimaryTextAtIndex);
        };
        /**
         * Clears the typeahead buffer.
         */
        MDCListFoundation.prototype.clearTypeaheadBuffer = function () {
            clearBuffer(this.typeaheadState);
        };
        return MDCListFoundation;
    }(MDCFoundation));

    /**
     * @license
     * Copyright 2018 Google Inc.
     *
     * Permission is hereby granted, free of charge, to any person obtaining a copy
     * of this software and associated documentation files (the "Software"), to deal
     * in the Software without restriction, including without limitation the rights
     * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
     * copies of the Software, and to permit persons to whom the Software is
     * furnished to do so, subject to the following conditions:
     *
     * The above copyright notice and this permission notice shall be included in
     * all copies or substantial portions of the Software.
     *
     * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
     * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
     * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
     * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
     * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
     * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
     * THE SOFTWARE.
     */
    var MDCMenuSurfaceFoundation = /** @class */ (function (_super) {
        __extends(MDCMenuSurfaceFoundation, _super);
        function MDCMenuSurfaceFoundation(adapter) {
            var _this = _super.call(this, __assign(__assign({}, MDCMenuSurfaceFoundation.defaultAdapter), adapter)) || this;
            _this.isSurfaceOpen = false;
            _this.isQuickOpen = false;
            _this.isHoistedElement = false;
            _this.isFixedPosition = false;
            _this.isHorizontallyCenteredOnViewport = false;
            _this.maxHeight = 0;
            _this.openAnimationEndTimerId = 0;
            _this.closeAnimationEndTimerId = 0;
            _this.animationRequestId = 0;
            _this.anchorCorner = Corner.TOP_START;
            /**
             * Corner of the menu surface to which menu surface is attached to anchor.
             *
             *  Anchor corner --->+----------+
             *                    |  ANCHOR  |
             *                    +----------+
             *  Origin corner --->+--------------+
             *                    |              |
             *                    |              |
             *                    | MENU SURFACE |
             *                    |              |
             *                    |              |
             *                    +--------------+
             */
            _this.originCorner = Corner.TOP_START;
            _this.anchorMargin = { top: 0, right: 0, bottom: 0, left: 0 };
            _this.position = { x: 0, y: 0 };
            return _this;
        }
        Object.defineProperty(MDCMenuSurfaceFoundation, "cssClasses", {
            get: function () {
                return cssClasses$4;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(MDCMenuSurfaceFoundation, "strings", {
            get: function () {
                return strings$2;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(MDCMenuSurfaceFoundation, "numbers", {
            get: function () {
                return numbers$2;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(MDCMenuSurfaceFoundation, "Corner", {
            get: function () {
                return Corner;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(MDCMenuSurfaceFoundation, "defaultAdapter", {
            /**
             * @see {@link MDCMenuSurfaceAdapter} for typing information on parameters and return types.
             */
            get: function () {
                // tslint:disable:object-literal-sort-keys Methods should be in the same order as the adapter interface.
                return {
                    addClass: function () { return undefined; },
                    removeClass: function () { return undefined; },
                    hasClass: function () { return false; },
                    hasAnchor: function () { return false; },
                    isElementInContainer: function () { return false; },
                    isFocused: function () { return false; },
                    isRtl: function () { return false; },
                    getInnerDimensions: function () { return ({ height: 0, width: 0 }); },
                    getAnchorDimensions: function () { return null; },
                    getWindowDimensions: function () { return ({ height: 0, width: 0 }); },
                    getBodyDimensions: function () { return ({ height: 0, width: 0 }); },
                    getWindowScroll: function () { return ({ x: 0, y: 0 }); },
                    setPosition: function () { return undefined; },
                    setMaxHeight: function () { return undefined; },
                    setTransformOrigin: function () { return undefined; },
                    saveFocus: function () { return undefined; },
                    restoreFocus: function () { return undefined; },
                    notifyClose: function () { return undefined; },
                    notifyOpen: function () { return undefined; },
                    notifyClosing: function () { return undefined; },
                };
                // tslint:enable:object-literal-sort-keys
            },
            enumerable: false,
            configurable: true
        });
        MDCMenuSurfaceFoundation.prototype.init = function () {
            var _a = MDCMenuSurfaceFoundation.cssClasses, ROOT = _a.ROOT, OPEN = _a.OPEN;
            if (!this.adapter.hasClass(ROOT)) {
                throw new Error(ROOT + " class required in root element.");
            }
            if (this.adapter.hasClass(OPEN)) {
                this.isSurfaceOpen = true;
            }
        };
        MDCMenuSurfaceFoundation.prototype.destroy = function () {
            clearTimeout(this.openAnimationEndTimerId);
            clearTimeout(this.closeAnimationEndTimerId);
            // Cancel any currently running animations.
            cancelAnimationFrame(this.animationRequestId);
        };
        /**
         * @param corner Default anchor corner alignment of top-left menu surface
         *     corner.
         */
        MDCMenuSurfaceFoundation.prototype.setAnchorCorner = function (corner) {
            this.anchorCorner = corner;
        };
        /**
         * Flip menu corner horizontally.
         */
        MDCMenuSurfaceFoundation.prototype.flipCornerHorizontally = function () {
            this.originCorner = this.originCorner ^ CornerBit.RIGHT;
        };
        /**
         * @param margin Set of margin values from anchor.
         */
        MDCMenuSurfaceFoundation.prototype.setAnchorMargin = function (margin) {
            this.anchorMargin.top = margin.top || 0;
            this.anchorMargin.right = margin.right || 0;
            this.anchorMargin.bottom = margin.bottom || 0;
            this.anchorMargin.left = margin.left || 0;
        };
        /** Used to indicate if the menu-surface is hoisted to the body. */
        MDCMenuSurfaceFoundation.prototype.setIsHoisted = function (isHoisted) {
            this.isHoistedElement = isHoisted;
        };
        /**
         * Used to set the menu-surface calculations based on a fixed position menu.
         */
        MDCMenuSurfaceFoundation.prototype.setFixedPosition = function (isFixedPosition) {
            this.isFixedPosition = isFixedPosition;
        };
        /**
         * @return Returns true if menu is in fixed (`position: fixed`) position.
         */
        MDCMenuSurfaceFoundation.prototype.isFixed = function () {
            return this.isFixedPosition;
        };
        /** Sets the menu-surface position on the page. */
        MDCMenuSurfaceFoundation.prototype.setAbsolutePosition = function (x, y) {
            this.position.x = this.isFinite(x) ? x : 0;
            this.position.y = this.isFinite(y) ? y : 0;
        };
        /** Sets whether menu-surface should be horizontally centered to viewport. */
        MDCMenuSurfaceFoundation.prototype.setIsHorizontallyCenteredOnViewport = function (isCentered) {
            this.isHorizontallyCenteredOnViewport = isCentered;
        };
        MDCMenuSurfaceFoundation.prototype.setQuickOpen = function (quickOpen) {
            this.isQuickOpen = quickOpen;
        };
        /**
         * Sets maximum menu-surface height on open.
         * @param maxHeight The desired max-height. Set to 0 (default) to
         *     automatically calculate max height based on available viewport space.
         */
        MDCMenuSurfaceFoundation.prototype.setMaxHeight = function (maxHeight) {
            this.maxHeight = maxHeight;
        };
        MDCMenuSurfaceFoundation.prototype.isOpen = function () {
            return this.isSurfaceOpen;
        };
        /**
         * Open the menu surface.
         */
        MDCMenuSurfaceFoundation.prototype.open = function () {
            var _this = this;
            if (this.isSurfaceOpen) {
                return;
            }
            this.adapter.saveFocus();
            if (this.isQuickOpen) {
                this.isSurfaceOpen = true;
                this.adapter.addClass(MDCMenuSurfaceFoundation.cssClasses.OPEN);
                this.dimensions = this.adapter.getInnerDimensions();
                this.autoposition();
                this.adapter.notifyOpen();
            }
            else {
                this.adapter.addClass(MDCMenuSurfaceFoundation.cssClasses.ANIMATING_OPEN);
                this.animationRequestId = requestAnimationFrame(function () {
                    _this.dimensions = _this.adapter.getInnerDimensions();
                    _this.autoposition();
                    _this.adapter.addClass(MDCMenuSurfaceFoundation.cssClasses.OPEN);
                    _this.openAnimationEndTimerId = setTimeout(function () {
                        _this.openAnimationEndTimerId = 0;
                        _this.adapter.removeClass(MDCMenuSurfaceFoundation.cssClasses.ANIMATING_OPEN);
                        _this.adapter.notifyOpen();
                    }, numbers$2.TRANSITION_OPEN_DURATION);
                });
                this.isSurfaceOpen = true;
            }
        };
        /**
         * Closes the menu surface.
         */
        MDCMenuSurfaceFoundation.prototype.close = function (skipRestoreFocus) {
            var _this = this;
            if (skipRestoreFocus === void 0) { skipRestoreFocus = false; }
            if (!this.isSurfaceOpen) {
                return;
            }
            this.adapter.notifyClosing();
            if (this.isQuickOpen) {
                this.isSurfaceOpen = false;
                if (!skipRestoreFocus) {
                    this.maybeRestoreFocus();
                }
                this.adapter.removeClass(MDCMenuSurfaceFoundation.cssClasses.OPEN);
                this.adapter.removeClass(MDCMenuSurfaceFoundation.cssClasses.IS_OPEN_BELOW);
                this.adapter.notifyClose();
                return;
            }
            this.adapter.addClass(MDCMenuSurfaceFoundation.cssClasses.ANIMATING_CLOSED);
            requestAnimationFrame(function () {
                _this.adapter.removeClass(MDCMenuSurfaceFoundation.cssClasses.OPEN);
                _this.adapter.removeClass(MDCMenuSurfaceFoundation.cssClasses.IS_OPEN_BELOW);
                _this.closeAnimationEndTimerId = setTimeout(function () {
                    _this.closeAnimationEndTimerId = 0;
                    _this.adapter.removeClass(MDCMenuSurfaceFoundation.cssClasses.ANIMATING_CLOSED);
                    _this.adapter.notifyClose();
                }, numbers$2.TRANSITION_CLOSE_DURATION);
            });
            this.isSurfaceOpen = false;
            if (!skipRestoreFocus) {
                this.maybeRestoreFocus();
            }
        };
        /** Handle clicks and close if not within menu-surface element. */
        MDCMenuSurfaceFoundation.prototype.handleBodyClick = function (evt) {
            var el = evt.target;
            if (this.adapter.isElementInContainer(el)) {
                return;
            }
            this.close();
        };
        /** Handle keys that close the surface. */
        MDCMenuSurfaceFoundation.prototype.handleKeydown = function (evt) {
            var keyCode = evt.keyCode, key = evt.key;
            var isEscape = key === 'Escape' || keyCode === 27;
            if (isEscape) {
                this.close();
            }
        };
        MDCMenuSurfaceFoundation.prototype.autoposition = function () {
            var _a;
            // Compute measurements for autoposition methods reuse.
            this.measurements = this.getAutoLayoutmeasurements();
            var corner = this.getoriginCorner();
            var maxMenuSurfaceHeight = this.getMenuSurfaceMaxHeight(corner);
            var verticalAlignment = this.hasBit(corner, CornerBit.BOTTOM) ? 'bottom' : 'top';
            var horizontalAlignment = this.hasBit(corner, CornerBit.RIGHT) ? 'right' : 'left';
            var horizontalOffset = this.getHorizontalOriginOffset(corner);
            var verticalOffset = this.getVerticalOriginOffset(corner);
            var _b = this.measurements, anchorSize = _b.anchorSize, surfaceSize = _b.surfaceSize;
            var position = (_a = {},
                _a[horizontalAlignment] = horizontalOffset,
                _a[verticalAlignment] = verticalOffset,
                _a);
            // Center align when anchor width is comparable or greater than menu
            // surface, otherwise keep corner.
            if (anchorSize.width / surfaceSize.width >
                numbers$2.ANCHOR_TO_MENU_SURFACE_WIDTH_RATIO) {
                horizontalAlignment = 'center';
            }
            // If the menu-surface has been hoisted to the body, it's no longer relative
            // to the anchor element
            if (this.isHoistedElement || this.isFixedPosition) {
                this.adjustPositionForHoistedElement(position);
            }
            this.adapter.setTransformOrigin(horizontalAlignment + " " + verticalAlignment);
            this.adapter.setPosition(position);
            this.adapter.setMaxHeight(maxMenuSurfaceHeight ? maxMenuSurfaceHeight + 'px' : '');
            // If it is opened from the top then add is-open-below class
            if (!this.hasBit(corner, CornerBit.BOTTOM)) {
                this.adapter.addClass(MDCMenuSurfaceFoundation.cssClasses.IS_OPEN_BELOW);
            }
        };
        /**
         * @return Measurements used to position menu surface popup.
         */
        MDCMenuSurfaceFoundation.prototype.getAutoLayoutmeasurements = function () {
            var anchorRect = this.adapter.getAnchorDimensions();
            var bodySize = this.adapter.getBodyDimensions();
            var viewportSize = this.adapter.getWindowDimensions();
            var windowScroll = this.adapter.getWindowScroll();
            if (!anchorRect) {
                // tslint:disable:object-literal-sort-keys Positional properties are more readable when they're grouped together
                anchorRect = {
                    top: this.position.y,
                    right: this.position.x,
                    bottom: this.position.y,
                    left: this.position.x,
                    width: 0,
                    height: 0,
                };
                // tslint:enable:object-literal-sort-keys
            }
            return {
                anchorSize: anchorRect,
                bodySize: bodySize,
                surfaceSize: this.dimensions,
                viewportDistance: {
                    // tslint:disable:object-literal-sort-keys Positional properties are more readable when they're grouped together
                    top: anchorRect.top,
                    right: viewportSize.width - anchorRect.right,
                    bottom: viewportSize.height - anchorRect.bottom,
                    left: anchorRect.left,
                    // tslint:enable:object-literal-sort-keys
                },
                viewportSize: viewportSize,
                windowScroll: windowScroll,
            };
        };
        /**
         * Computes the corner of the anchor from which to animate and position the
         * menu surface.
         *
         * Only LEFT or RIGHT bit is used to position the menu surface ignoring RTL
         * context. E.g., menu surface will be positioned from right side on TOP_END.
         */
        MDCMenuSurfaceFoundation.prototype.getoriginCorner = function () {
            var corner = this.originCorner;
            var _a = this.measurements, viewportDistance = _a.viewportDistance, anchorSize = _a.anchorSize, surfaceSize = _a.surfaceSize;
            var MARGIN_TO_EDGE = MDCMenuSurfaceFoundation.numbers.MARGIN_TO_EDGE;
            var isAnchoredToBottom = this.hasBit(this.anchorCorner, CornerBit.BOTTOM);
            var availableTop;
            var availableBottom;
            if (isAnchoredToBottom) {
                availableTop =
                    viewportDistance.top - MARGIN_TO_EDGE + this.anchorMargin.bottom;
                availableBottom =
                    viewportDistance.bottom - MARGIN_TO_EDGE - this.anchorMargin.bottom;
            }
            else {
                availableTop =
                    viewportDistance.top - MARGIN_TO_EDGE + this.anchorMargin.top;
                availableBottom = viewportDistance.bottom - MARGIN_TO_EDGE +
                    anchorSize.height - this.anchorMargin.top;
            }
            var isAvailableBottom = availableBottom - surfaceSize.height > 0;
            if (!isAvailableBottom && availableTop > availableBottom) {
                // Attach bottom side of surface to the anchor.
                corner = this.setBit(corner, CornerBit.BOTTOM);
            }
            var isRtl = this.adapter.isRtl();
            var isFlipRtl = this.hasBit(this.anchorCorner, CornerBit.FLIP_RTL);
            var hasRightBit = this.hasBit(this.anchorCorner, CornerBit.RIGHT) ||
                this.hasBit(corner, CornerBit.RIGHT);
            // Whether surface attached to right side of anchor element.
            var isAnchoredToRight = false;
            // Anchored to start
            if (isRtl && isFlipRtl) {
                isAnchoredToRight = !hasRightBit;
            }
            else {
                // Anchored to right
                isAnchoredToRight = hasRightBit;
            }
            var availableLeft;
            var availableRight;
            if (isAnchoredToRight) {
                availableLeft =
                    viewportDistance.left + anchorSize.width + this.anchorMargin.right;
                availableRight = viewportDistance.right - this.anchorMargin.right;
            }
            else {
                availableLeft = viewportDistance.left + this.anchorMargin.left;
                availableRight =
                    viewportDistance.right + anchorSize.width - this.anchorMargin.left;
            }
            var isAvailableLeft = availableLeft - surfaceSize.width > 0;
            var isAvailableRight = availableRight - surfaceSize.width > 0;
            var isOriginCornerAlignedToEnd = this.hasBit(corner, CornerBit.FLIP_RTL) &&
                this.hasBit(corner, CornerBit.RIGHT);
            if (isAvailableRight && isOriginCornerAlignedToEnd && isRtl ||
                !isAvailableLeft && isOriginCornerAlignedToEnd) {
                // Attach left side of surface to the anchor.
                corner = this.unsetBit(corner, CornerBit.RIGHT);
            }
            else if (isAvailableLeft && isAnchoredToRight && isRtl ||
                (isAvailableLeft && !isAnchoredToRight && hasRightBit) ||
                (!isAvailableRight && availableLeft >= availableRight)) {
                // Attach right side of surface to the anchor.
                corner = this.setBit(corner, CornerBit.RIGHT);
            }
            return corner;
        };
        /**
         * @param corner Origin corner of the menu surface.
         * @return Maximum height of the menu surface, based on available space. 0
         *     indicates should not be set.
         */
        MDCMenuSurfaceFoundation.prototype.getMenuSurfaceMaxHeight = function (corner) {
            if (this.maxHeight > 0) {
                return this.maxHeight;
            }
            var viewportDistance = this.measurements.viewportDistance;
            var maxHeight = 0;
            var isBottomAligned = this.hasBit(corner, CornerBit.BOTTOM);
            var isBottomAnchored = this.hasBit(this.anchorCorner, CornerBit.BOTTOM);
            var MARGIN_TO_EDGE = MDCMenuSurfaceFoundation.numbers.MARGIN_TO_EDGE;
            // When maximum height is not specified, it is handled from CSS.
            if (isBottomAligned) {
                maxHeight = viewportDistance.top + this.anchorMargin.top - MARGIN_TO_EDGE;
                if (!isBottomAnchored) {
                    maxHeight += this.measurements.anchorSize.height;
                }
            }
            else {
                maxHeight = viewportDistance.bottom - this.anchorMargin.bottom +
                    this.measurements.anchorSize.height - MARGIN_TO_EDGE;
                if (isBottomAnchored) {
                    maxHeight -= this.measurements.anchorSize.height;
                }
            }
            return maxHeight;
        };
        /**
         * @param corner Origin corner of the menu surface.
         * @return Horizontal offset of menu surface origin corner from corresponding
         *     anchor corner.
         */
        MDCMenuSurfaceFoundation.prototype.getHorizontalOriginOffset = function (corner) {
            var anchorSize = this.measurements.anchorSize;
            // isRightAligned corresponds to using the 'right' property on the surface.
            var isRightAligned = this.hasBit(corner, CornerBit.RIGHT);
            var avoidHorizontalOverlap = this.hasBit(this.anchorCorner, CornerBit.RIGHT);
            if (isRightAligned) {
                var rightOffset = avoidHorizontalOverlap ?
                    anchorSize.width - this.anchorMargin.left :
                    this.anchorMargin.right;
                // For hoisted or fixed elements, adjust the offset by the difference
                // between viewport width and body width so when we calculate the right
                // value (`adjustPositionForHoistedElement`) based on the element
                // position, the right property is correct.
                if (this.isHoistedElement || this.isFixedPosition) {
                    return rightOffset -
                        (this.measurements.viewportSize.width -
                            this.measurements.bodySize.width);
                }
                return rightOffset;
            }
            return avoidHorizontalOverlap ? anchorSize.width - this.anchorMargin.right :
                this.anchorMargin.left;
        };
        /**
         * @param corner Origin corner of the menu surface.
         * @return Vertical offset of menu surface origin corner from corresponding
         *     anchor corner.
         */
        MDCMenuSurfaceFoundation.prototype.getVerticalOriginOffset = function (corner) {
            var anchorSize = this.measurements.anchorSize;
            var isBottomAligned = this.hasBit(corner, CornerBit.BOTTOM);
            var avoidVerticalOverlap = this.hasBit(this.anchorCorner, CornerBit.BOTTOM);
            var y = 0;
            if (isBottomAligned) {
                y = avoidVerticalOverlap ? anchorSize.height - this.anchorMargin.top :
                    -this.anchorMargin.bottom;
            }
            else {
                y = avoidVerticalOverlap ?
                    (anchorSize.height + this.anchorMargin.bottom) :
                    this.anchorMargin.top;
            }
            return y;
        };
        /**
         * Calculates the offsets for positioning the menu-surface when the
         * menu-surface has been hoisted to the body.
         */
        MDCMenuSurfaceFoundation.prototype.adjustPositionForHoistedElement = function (position) {
            var e_1, _a;
            var _b = this.measurements, windowScroll = _b.windowScroll, viewportDistance = _b.viewportDistance, surfaceSize = _b.surfaceSize, viewportSize = _b.viewportSize;
            var props = Object.keys(position);
            try {
                for (var props_1 = __values(props), props_1_1 = props_1.next(); !props_1_1.done; props_1_1 = props_1.next()) {
                    var prop = props_1_1.value;
                    var value = position[prop] || 0;
                    if (this.isHorizontallyCenteredOnViewport &&
                        (prop === 'left' || prop === 'right')) {
                        position[prop] = (viewportSize.width - surfaceSize.width) / 2;
                        continue;
                    }
                    // Hoisted surfaces need to have the anchor elements location on the page
                    // added to the position properties for proper alignment on the body.
                    value += viewportDistance[prop];
                    // Surfaces that are absolutely positioned need to have additional
                    // calculations for scroll and bottom positioning.
                    if (!this.isFixedPosition) {
                        if (prop === 'top') {
                            value += windowScroll.y;
                        }
                        else if (prop === 'bottom') {
                            value -= windowScroll.y;
                        }
                        else if (prop === 'left') {
                            value += windowScroll.x;
                        }
                        else { // prop === 'right'
                            value -= windowScroll.x;
                        }
                    }
                    position[prop] = value;
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (props_1_1 && !props_1_1.done && (_a = props_1.return)) _a.call(props_1);
                }
                finally { if (e_1) throw e_1.error; }
            }
        };
        /**
         * The last focused element when the menu surface was opened should regain
         * focus, if the user is focused on or within the menu surface when it is
         * closed.
         */
        MDCMenuSurfaceFoundation.prototype.maybeRestoreFocus = function () {
            var _this = this;
            var isRootFocused = this.adapter.isFocused();
            var childHasFocus = document.activeElement &&
                this.adapter.isElementInContainer(document.activeElement);
            if (isRootFocused || childHasFocus) {
                // Wait before restoring focus when closing the menu surface. This is
                // important because if a touch event triggered the menu close, and the
                // subsequent mouse event occurs after focus is restored, then the
                // restored focus would be lost.
                setTimeout(function () {
                    _this.adapter.restoreFocus();
                }, numbers$2.TOUCH_EVENT_WAIT_MS);
            }
        };
        MDCMenuSurfaceFoundation.prototype.hasBit = function (corner, bit) {
            return Boolean(corner & bit); // tslint:disable-line:no-bitwise
        };
        MDCMenuSurfaceFoundation.prototype.setBit = function (corner, bit) {
            return corner | bit; // tslint:disable-line:no-bitwise
        };
        MDCMenuSurfaceFoundation.prototype.unsetBit = function (corner, bit) {
            return corner ^ bit;
        };
        /**
         * isFinite that doesn't force conversion to number type.
         * Equivalent to Number.isFinite in ES2015, which is not supported in IE.
         */
        MDCMenuSurfaceFoundation.prototype.isFinite = function (num) {
            return typeof num === 'number' && isFinite(num);
        };
        return MDCMenuSurfaceFoundation;
    }(MDCFoundation));

    /**
     * @license
     * Copyright 2018 Google Inc.
     *
     * Permission is hereby granted, free of charge, to any person obtaining a copy
     * of this software and associated documentation files (the "Software"), to deal
     * in the Software without restriction, including without limitation the rights
     * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
     * copies of the Software, and to permit persons to whom the Software is
     * furnished to do so, subject to the following conditions:
     *
     * The above copyright notice and this permission notice shall be included in
     * all copies or substantial portions of the Software.
     *
     * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
     * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
     * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
     * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
     * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
     * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
     * THE SOFTWARE.
     */
    var cssClasses$2 = {
        MENU_SELECTED_LIST_ITEM: 'mdc-menu-item--selected',
        MENU_SELECTION_GROUP: 'mdc-menu__selection-group',
        ROOT: 'mdc-menu',
    };
    var strings = {
        ARIA_CHECKED_ATTR: 'aria-checked',
        ARIA_DISABLED_ATTR: 'aria-disabled',
        CHECKBOX_SELECTOR: 'input[type="checkbox"]',
        LIST_SELECTOR: '.mdc-list,.mdc-deprecated-list',
        SELECTED_EVENT: 'MDCMenu:selected',
        SKIP_RESTORE_FOCUS: 'data-menu-item-skip-restore-focus',
    };
    var numbers = {
        FOCUS_ROOT_INDEX: -1,
    };
    var DefaultFocusState;
    (function (DefaultFocusState) {
        DefaultFocusState[DefaultFocusState["NONE"] = 0] = "NONE";
        DefaultFocusState[DefaultFocusState["LIST_ROOT"] = 1] = "LIST_ROOT";
        DefaultFocusState[DefaultFocusState["FIRST_ITEM"] = 2] = "FIRST_ITEM";
        DefaultFocusState[DefaultFocusState["LAST_ITEM"] = 3] = "LAST_ITEM";
    })(DefaultFocusState || (DefaultFocusState = {}));

    /**
     * @license
     * Copyright 2018 Google Inc.
     *
     * Permission is hereby granted, free of charge, to any person obtaining a copy
     * of this software and associated documentation files (the "Software"), to deal
     * in the Software without restriction, including without limitation the rights
     * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
     * copies of the Software, and to permit persons to whom the Software is
     * furnished to do so, subject to the following conditions:
     *
     * The above copyright notice and this permission notice shall be included in
     * all copies or substantial portions of the Software.
     *
     * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
     * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
     * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
     * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
     * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
     * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
     * THE SOFTWARE.
     */
    var MDCMenuFoundation = /** @class */ (function (_super) {
        __extends(MDCMenuFoundation, _super);
        function MDCMenuFoundation(adapter) {
            var _this = _super.call(this, __assign(__assign({}, MDCMenuFoundation.defaultAdapter), adapter)) || this;
            _this.closeAnimationEndTimerId = 0;
            _this.defaultFocusState = DefaultFocusState.LIST_ROOT;
            _this.selectedIndex = -1;
            return _this;
        }
        Object.defineProperty(MDCMenuFoundation, "cssClasses", {
            get: function () {
                return cssClasses$2;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(MDCMenuFoundation, "strings", {
            get: function () {
                return strings;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(MDCMenuFoundation, "numbers", {
            get: function () {
                return numbers;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(MDCMenuFoundation, "defaultAdapter", {
            /**
             * @see {@link MDCMenuAdapter} for typing information on parameters and return types.
             */
            get: function () {
                // tslint:disable:object-literal-sort-keys Methods should be in the same order as the adapter interface.
                return {
                    addClassToElementAtIndex: function () { return undefined; },
                    removeClassFromElementAtIndex: function () { return undefined; },
                    addAttributeToElementAtIndex: function () { return undefined; },
                    removeAttributeFromElementAtIndex: function () { return undefined; },
                    getAttributeFromElementAtIndex: function () { return null; },
                    elementContainsClass: function () { return false; },
                    closeSurface: function () { return undefined; },
                    getElementIndex: function () { return -1; },
                    notifySelected: function () { return undefined; },
                    getMenuItemCount: function () { return 0; },
                    focusItemAtIndex: function () { return undefined; },
                    focusListRoot: function () { return undefined; },
                    getSelectedSiblingOfItemAtIndex: function () { return -1; },
                    isSelectableItemAtIndex: function () { return false; },
                };
                // tslint:enable:object-literal-sort-keys
            },
            enumerable: false,
            configurable: true
        });
        MDCMenuFoundation.prototype.destroy = function () {
            if (this.closeAnimationEndTimerId) {
                clearTimeout(this.closeAnimationEndTimerId);
            }
            this.adapter.closeSurface();
        };
        MDCMenuFoundation.prototype.handleKeydown = function (evt) {
            var key = evt.key, keyCode = evt.keyCode;
            var isTab = key === 'Tab' || keyCode === 9;
            if (isTab) {
                this.adapter.closeSurface(/** skipRestoreFocus */ true);
            }
        };
        MDCMenuFoundation.prototype.handleItemAction = function (listItem) {
            var _this = this;
            var index = this.adapter.getElementIndex(listItem);
            if (index < 0) {
                return;
            }
            this.adapter.notifySelected({ index: index });
            var skipRestoreFocus = this.adapter.getAttributeFromElementAtIndex(index, strings.SKIP_RESTORE_FOCUS) === 'true';
            this.adapter.closeSurface(skipRestoreFocus);
            // Wait for the menu to close before adding/removing classes that affect styles.
            this.closeAnimationEndTimerId = setTimeout(function () {
                // Recompute the index in case the menu contents have changed.
                var recomputedIndex = _this.adapter.getElementIndex(listItem);
                if (recomputedIndex >= 0 &&
                    _this.adapter.isSelectableItemAtIndex(recomputedIndex)) {
                    _this.setSelectedIndex(recomputedIndex);
                }
            }, MDCMenuSurfaceFoundation.numbers.TRANSITION_CLOSE_DURATION);
        };
        MDCMenuFoundation.prototype.handleMenuSurfaceOpened = function () {
            switch (this.defaultFocusState) {
                case DefaultFocusState.FIRST_ITEM:
                    this.adapter.focusItemAtIndex(0);
                    break;
                case DefaultFocusState.LAST_ITEM:
                    this.adapter.focusItemAtIndex(this.adapter.getMenuItemCount() - 1);
                    break;
                case DefaultFocusState.NONE:
                    // Do nothing.
                    break;
                default:
                    this.adapter.focusListRoot();
                    break;
            }
        };
        /**
         * Sets default focus state where the menu should focus every time when menu
         * is opened. Focuses the list root (`DefaultFocusState.LIST_ROOT`) element by
         * default.
         */
        MDCMenuFoundation.prototype.setDefaultFocusState = function (focusState) {
            this.defaultFocusState = focusState;
        };
        /** @return Index of the currently selected list item within the menu. */
        MDCMenuFoundation.prototype.getSelectedIndex = function () {
            return this.selectedIndex;
        };
        /**
         * Selects the list item at `index` within the menu.
         * @param index Index of list item within the menu.
         */
        MDCMenuFoundation.prototype.setSelectedIndex = function (index) {
            this.validatedIndex(index);
            if (!this.adapter.isSelectableItemAtIndex(index)) {
                throw new Error('MDCMenuFoundation: No selection group at specified index.');
            }
            var prevSelectedIndex = this.adapter.getSelectedSiblingOfItemAtIndex(index);
            if (prevSelectedIndex >= 0) {
                this.adapter.removeAttributeFromElementAtIndex(prevSelectedIndex, strings.ARIA_CHECKED_ATTR);
                this.adapter.removeClassFromElementAtIndex(prevSelectedIndex, cssClasses$2.MENU_SELECTED_LIST_ITEM);
            }
            this.adapter.addClassToElementAtIndex(index, cssClasses$2.MENU_SELECTED_LIST_ITEM);
            this.adapter.addAttributeToElementAtIndex(index, strings.ARIA_CHECKED_ATTR, 'true');
            this.selectedIndex = index;
        };
        /**
         * Sets the enabled state to isEnabled for the menu item at the given index.
         * @param index Index of the menu item
         * @param isEnabled The desired enabled state of the menu item.
         */
        MDCMenuFoundation.prototype.setEnabled = function (index, isEnabled) {
            this.validatedIndex(index);
            if (isEnabled) {
                this.adapter.removeClassFromElementAtIndex(index, cssClasses$3.LIST_ITEM_DISABLED_CLASS);
                this.adapter.addAttributeToElementAtIndex(index, strings.ARIA_DISABLED_ATTR, 'false');
            }
            else {
                this.adapter.addClassToElementAtIndex(index, cssClasses$3.LIST_ITEM_DISABLED_CLASS);
                this.adapter.addAttributeToElementAtIndex(index, strings.ARIA_DISABLED_ATTR, 'true');
            }
        };
        MDCMenuFoundation.prototype.validatedIndex = function (index) {
            var menuSize = this.adapter.getMenuItemCount();
            var isIndexInRange = index >= 0 && index < menuSize;
            if (!isIndexInRange) {
                throw new Error('MDCMenuFoundation: No list item at specified index.');
            }
        };
        return MDCMenuFoundation;
    }(MDCFoundation));

    /* node_modules\@smui\menu-surface\dist\MenuSurface.svelte generated by Svelte v3.46.4 */

    const { document: document_1 } = globals;
    const file$9 = "node_modules\\@smui\\menu-surface\\dist\\MenuSurface.svelte";

    function create_fragment$b(ctx) {
    	let t;
    	let div;
    	let div_class_value;
    	let div_style_value;
    	let useActions_action;
    	let current;
    	let mounted;
    	let dispose;
    	const default_slot_template = /*#slots*/ ctx[31].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[30], null);

    	let div_levels = [
    		{
    			class: div_class_value = classMap({
    				[/*className*/ ctx[2]]: true,
    				'mdc-menu-surface': true,
    				'mdc-menu-surface--fixed': /*fixed*/ ctx[5],
    				'mdc-menu-surface--open': /*isStatic*/ ctx[4],
    				'smui-menu-surface--static': /*isStatic*/ ctx[4],
    				'mdc-menu-surface--fullwidth': /*fullWidth*/ ctx[7],
    				.../*internalClasses*/ ctx[10]
    			})
    		},
    		{
    			style: div_style_value = Object.entries(/*internalStyles*/ ctx[11]).map(func$3).concat([/*style*/ ctx[3]]).join(' ')
    		},
    		/*$$restProps*/ ctx[13]
    	];

    	let div_data = {};

    	for (let i = 0; i < div_levels.length; i += 1) {
    		div_data = assign(div_data, div_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			t = space();
    			div = element("div");
    			if (default_slot) default_slot.c();
    			set_attributes(div, div_data);
    			add_location(div, file$9, 4, 0, 117);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    			insert_dev(target, div, anchor);

    			if (default_slot) {
    				default_slot.m(div, null);
    			}

    			/*div_binding*/ ctx[33](div);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(document_1.body, "click", /*click_handler*/ ctx[32], true, false, false),
    					action_destroyer(useActions_action = useActions.call(null, div, /*use*/ ctx[1])),
    					action_destroyer(/*forwardEvents*/ ctx[12].call(null, div)),
    					listen_dev(div, "keydown", /*keydown_handler*/ ctx[34], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty[0] & /*$$scope*/ 1073741824)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[30],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[30])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[30], dirty, null),
    						null
    					);
    				}
    			}

    			set_attributes(div, div_data = get_spread_update(div_levels, [
    				(!current || dirty[0] & /*className, fixed, isStatic, fullWidth, internalClasses*/ 1204 && div_class_value !== (div_class_value = classMap({
    					[/*className*/ ctx[2]]: true,
    					'mdc-menu-surface': true,
    					'mdc-menu-surface--fixed': /*fixed*/ ctx[5],
    					'mdc-menu-surface--open': /*isStatic*/ ctx[4],
    					'smui-menu-surface--static': /*isStatic*/ ctx[4],
    					'mdc-menu-surface--fullwidth': /*fullWidth*/ ctx[7],
    					.../*internalClasses*/ ctx[10]
    				}))) && { class: div_class_value },
    				(!current || dirty[0] & /*internalStyles, style*/ 2056 && div_style_value !== (div_style_value = Object.entries(/*internalStyles*/ ctx[11]).map(func$3).concat([/*style*/ ctx[3]]).join(' '))) && { style: div_style_value },
    				dirty[0] & /*$$restProps*/ 8192 && /*$$restProps*/ ctx[13]
    			]));

    			if (useActions_action && is_function(useActions_action.update) && dirty[0] & /*use*/ 2) useActions_action.update.call(null, /*use*/ ctx[1]);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    			if (detaching) detach_dev(div);
    			if (default_slot) default_slot.d(detaching);
    			/*div_binding*/ ctx[33](null);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$b.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    const func$3 = ([name, value]) => `${name}: ${value};`;

    function instance_1$4($$self, $$props, $$invalidate) {
    	const omit_props_names = [
    		"use","class","style","static","anchor","fixed","open","managed","fullWidth","quickOpen","anchorElement","anchorCorner","anchorMargin","maxHeight","horizontallyCenteredOnViewport","isOpen","setOpen","setAbsolutePosition","setIsHoisted","isFixed","getElement"
    	];

    	let $$restProps = compute_rest_props($$props, omit_props_names);
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('MenuSurface', slots, ['default']);
    	var _a, _b, _c;
    	const forwardEvents = forwardEventsBuilder(get_current_component());
    	let { use = [] } = $$props;
    	let { class: className = '' } = $$props;
    	let { style = '' } = $$props;
    	let { static: isStatic = false } = $$props;
    	let { anchor = true } = $$props;
    	let { fixed = false } = $$props;
    	let { open = isStatic } = $$props;
    	let { managed = false } = $$props;
    	let { fullWidth = false } = $$props;
    	let { quickOpen = false } = $$props;
    	let { anchorElement = undefined } = $$props;
    	let { anchorCorner = undefined } = $$props;
    	let { anchorMargin = { top: 0, right: 0, bottom: 0, left: 0 } } = $$props;
    	let { maxHeight = 0 } = $$props;
    	let { horizontallyCenteredOnViewport = false } = $$props;
    	let element;
    	let instance;
    	let internalClasses = {};
    	let internalStyles = {};
    	let previousFocus = undefined;
    	setContext('SMUI:list:role', 'menu');
    	setContext('SMUI:list:item:role', 'menuitem');
    	const iCorner = Corner;

    	onMount(() => {
    		$$invalidate(9, instance = new MDCMenuSurfaceFoundation({
    				addClass,
    				removeClass,
    				hasClass,
    				hasAnchor: () => !!anchorElement,
    				notifyClose: () => {
    					if (!managed) {
    						$$invalidate(0, open = isStatic);
    					}

    					if (!open) {
    						dispatch(element, 'SMUIMenuSurface:closed', undefined, undefined, true);
    					}
    				},
    				notifyClosing: () => {
    					if (!managed) {
    						$$invalidate(0, open = isStatic);
    					}

    					if (!open) {
    						dispatch(element, 'SMUIMenuSurface:closing', undefined, undefined, true);
    					}
    				},
    				notifyOpen: () => {
    					if (!managed) {
    						$$invalidate(0, open = true);
    					}

    					if (open) {
    						dispatch(element, 'SMUIMenuSurface:opened', undefined, undefined, true);
    					}
    				},
    				isElementInContainer: el => element.contains(el),
    				isRtl: () => getComputedStyle(element).getPropertyValue('direction') === 'rtl',
    				setTransformOrigin: origin => {
    					$$invalidate(11, internalStyles['transform-origin'] = origin, internalStyles);
    				},
    				isFocused: () => document.activeElement === element,
    				saveFocus: () => {
    					var _a;

    					previousFocus = (_a = document.activeElement) !== null && _a !== void 0
    					? _a
    					: undefined;
    				},
    				restoreFocus: () => {
    					if ((!element || element.contains(document.activeElement)) && previousFocus && document.contains(previousFocus) && 'focus' in previousFocus) {
    						previousFocus.focus();
    					}
    				},
    				getInnerDimensions: () => {
    					return {
    						width: element.offsetWidth,
    						height: element.offsetHeight
    					};
    				},
    				getAnchorDimensions: () => anchorElement
    				? anchorElement.getBoundingClientRect()
    				: null,
    				getWindowDimensions: () => {
    					return {
    						width: window.innerWidth,
    						height: window.innerHeight
    					};
    				},
    				getBodyDimensions: () => {
    					return {
    						width: document.body.clientWidth,
    						height: document.body.clientHeight
    					};
    				},
    				getWindowScroll: () => {
    					return {
    						x: window.pageXOffset,
    						y: window.pageYOffset
    					};
    				},
    				setPosition: position => {
    					$$invalidate(11, internalStyles.left = 'left' in position ? `${position.left}px` : '', internalStyles);
    					$$invalidate(11, internalStyles.right = 'right' in position ? `${position.right}px` : '', internalStyles);
    					$$invalidate(11, internalStyles.top = 'top' in position ? `${position.top}px` : '', internalStyles);
    					$$invalidate(11, internalStyles.bottom = 'bottom' in position ? `${position.bottom}px` : '', internalStyles);
    				},
    				setMaxHeight: height => {
    					$$invalidate(11, internalStyles.maxHeight = height, internalStyles);
    				}
    			}));

    		const accessor = {
    			get open() {
    				return open;
    			},
    			set open(value) {
    				$$invalidate(0, open = value);
    			},
    			closeProgrammatic
    		};

    		dispatch(element, 'SMUIMenuSurface:mount', accessor);
    		instance.init();

    		return () => {
    			var _a;
    			const isHoisted = instance.isHoistedElement;
    			instance.destroy();

    			if (isHoisted) {
    				(_a = element.parentNode) === null || _a === void 0
    				? void 0
    				: _a.removeChild(element);
    			}
    		};
    	});

    	onDestroy(() => {
    		var _a;

    		if (anchor) {
    			element && ((_a = element.parentElement) === null || _a === void 0
    			? void 0
    			: _a.classList.remove('mdc-menu-surface--anchor'));
    		}
    	});

    	function hasClass(className) {
    		return className in internalClasses
    		? internalClasses[className]
    		: getElement().classList.contains(className);
    	}

    	function addClass(className) {
    		if (!internalClasses[className]) {
    			$$invalidate(10, internalClasses[className] = true, internalClasses);
    		}
    	}

    	function removeClass(className) {
    		if (!(className in internalClasses) || internalClasses[className]) {
    			$$invalidate(10, internalClasses[className] = false, internalClasses);
    		}
    	}

    	function closeProgrammatic(skipRestoreFocus) {
    		instance.close(skipRestoreFocus);
    		$$invalidate(0, open = false);
    	}

    	function isOpen() {
    		return open;
    	}

    	function setOpen(value) {
    		$$invalidate(0, open = value);
    	}

    	function setAbsolutePosition(x, y) {
    		return instance.setAbsolutePosition(x, y);
    	}

    	function setIsHoisted(isHoisted) {
    		return instance.setIsHoisted(isHoisted);
    	}

    	function isFixed() {
    		return instance.isFixed();
    	}

    	function getElement() {
    		return element;
    	}

    	const click_handler = event => instance && open && !managed && instance.handleBodyClick(event);

    	function div_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			element = $$value;
    			$$invalidate(8, element);
    		});
    	}

    	const keydown_handler = event => instance && instance.handleKeydown(event);

    	$$self.$$set = $$new_props => {
    		$$props = assign(assign({}, $$props), exclude_internal_props($$new_props));
    		$$invalidate(13, $$restProps = compute_rest_props($$props, omit_props_names));
    		if ('use' in $$new_props) $$invalidate(1, use = $$new_props.use);
    		if ('class' in $$new_props) $$invalidate(2, className = $$new_props.class);
    		if ('style' in $$new_props) $$invalidate(3, style = $$new_props.style);
    		if ('static' in $$new_props) $$invalidate(4, isStatic = $$new_props.static);
    		if ('anchor' in $$new_props) $$invalidate(15, anchor = $$new_props.anchor);
    		if ('fixed' in $$new_props) $$invalidate(5, fixed = $$new_props.fixed);
    		if ('open' in $$new_props) $$invalidate(0, open = $$new_props.open);
    		if ('managed' in $$new_props) $$invalidate(6, managed = $$new_props.managed);
    		if ('fullWidth' in $$new_props) $$invalidate(7, fullWidth = $$new_props.fullWidth);
    		if ('quickOpen' in $$new_props) $$invalidate(16, quickOpen = $$new_props.quickOpen);
    		if ('anchorElement' in $$new_props) $$invalidate(14, anchorElement = $$new_props.anchorElement);
    		if ('anchorCorner' in $$new_props) $$invalidate(17, anchorCorner = $$new_props.anchorCorner);
    		if ('anchorMargin' in $$new_props) $$invalidate(18, anchorMargin = $$new_props.anchorMargin);
    		if ('maxHeight' in $$new_props) $$invalidate(19, maxHeight = $$new_props.maxHeight);
    		if ('horizontallyCenteredOnViewport' in $$new_props) $$invalidate(20, horizontallyCenteredOnViewport = $$new_props.horizontallyCenteredOnViewport);
    		if ('$$scope' in $$new_props) $$invalidate(30, $$scope = $$new_props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		_a,
    		_b,
    		_c,
    		MDCMenuSurfaceFoundation,
    		onMount,
    		onDestroy,
    		setContext,
    		get_current_component,
    		forwardEventsBuilder,
    		classMap,
    		useActions,
    		dispatch,
    		Corner,
    		forwardEvents,
    		use,
    		className,
    		style,
    		isStatic,
    		anchor,
    		fixed,
    		open,
    		managed,
    		fullWidth,
    		quickOpen,
    		anchorElement,
    		anchorCorner,
    		anchorMargin,
    		maxHeight,
    		horizontallyCenteredOnViewport,
    		element,
    		instance,
    		internalClasses,
    		internalStyles,
    		previousFocus,
    		iCorner,
    		hasClass,
    		addClass,
    		removeClass,
    		closeProgrammatic,
    		isOpen,
    		setOpen,
    		setAbsolutePosition,
    		setIsHoisted,
    		isFixed,
    		getElement
    	});

    	$$self.$inject_state = $$new_props => {
    		if ('_a' in $$props) $$invalidate(27, _a = $$new_props._a);
    		if ('_b' in $$props) $$invalidate(28, _b = $$new_props._b);
    		if ('_c' in $$props) $$invalidate(29, _c = $$new_props._c);
    		if ('use' in $$props) $$invalidate(1, use = $$new_props.use);
    		if ('className' in $$props) $$invalidate(2, className = $$new_props.className);
    		if ('style' in $$props) $$invalidate(3, style = $$new_props.style);
    		if ('isStatic' in $$props) $$invalidate(4, isStatic = $$new_props.isStatic);
    		if ('anchor' in $$props) $$invalidate(15, anchor = $$new_props.anchor);
    		if ('fixed' in $$props) $$invalidate(5, fixed = $$new_props.fixed);
    		if ('open' in $$props) $$invalidate(0, open = $$new_props.open);
    		if ('managed' in $$props) $$invalidate(6, managed = $$new_props.managed);
    		if ('fullWidth' in $$props) $$invalidate(7, fullWidth = $$new_props.fullWidth);
    		if ('quickOpen' in $$props) $$invalidate(16, quickOpen = $$new_props.quickOpen);
    		if ('anchorElement' in $$props) $$invalidate(14, anchorElement = $$new_props.anchorElement);
    		if ('anchorCorner' in $$props) $$invalidate(17, anchorCorner = $$new_props.anchorCorner);
    		if ('anchorMargin' in $$props) $$invalidate(18, anchorMargin = $$new_props.anchorMargin);
    		if ('maxHeight' in $$props) $$invalidate(19, maxHeight = $$new_props.maxHeight);
    		if ('horizontallyCenteredOnViewport' in $$props) $$invalidate(20, horizontallyCenteredOnViewport = $$new_props.horizontallyCenteredOnViewport);
    		if ('element' in $$props) $$invalidate(8, element = $$new_props.element);
    		if ('instance' in $$props) $$invalidate(9, instance = $$new_props.instance);
    		if ('internalClasses' in $$props) $$invalidate(10, internalClasses = $$new_props.internalClasses);
    		if ('internalStyles' in $$props) $$invalidate(11, internalStyles = $$new_props.internalStyles);
    		if ('previousFocus' in $$props) previousFocus = $$new_props.previousFocus;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty[0] & /*element, anchor, _a, _b, _c*/ 939557120) {
    			if (element && anchor && !($$invalidate(27, _a = element.parentElement) === null || _a === void 0
    			? void 0
    			: _a.classList.contains('mdc-menu-surface--anchor'))) {
    				$$invalidate(28, _b = element.parentElement) === null || _b === void 0
    				? void 0
    				: _b.classList.add('mdc-menu-surface--anchor');

    				$$invalidate(14, anchorElement = $$invalidate(29, _c = element.parentElement) !== null && _c !== void 0
    				? _c
    				: undefined);
    			}
    		}

    		if ($$self.$$.dirty[0] & /*instance, open*/ 513) {
    			if (instance && instance.isOpen() !== open) {
    				if (open) {
    					instance.open();
    				} else {
    					instance.close();
    				}
    			}
    		}

    		if ($$self.$$.dirty[0] & /*instance, quickOpen*/ 66048) {
    			if (instance) {
    				instance.setQuickOpen(quickOpen);
    			}
    		}

    		if ($$self.$$.dirty[0] & /*instance, fixed*/ 544) {
    			if (instance) {
    				instance.setFixedPosition(fixed);
    			}
    		}

    		if ($$self.$$.dirty[0] & /*instance, maxHeight*/ 524800) {
    			if (instance && maxHeight > 0) {
    				instance.setMaxHeight(maxHeight);
    			}
    		}

    		if ($$self.$$.dirty[0] & /*instance, horizontallyCenteredOnViewport*/ 1049088) {
    			if (instance) {
    				instance.setIsHorizontallyCenteredOnViewport(horizontallyCenteredOnViewport);
    			}
    		}

    		if ($$self.$$.dirty[0] & /*instance, anchorCorner*/ 131584) {
    			if (instance && anchorCorner != null) {
    				if (typeof anchorCorner === 'string') {
    					instance.setAnchorCorner(iCorner[anchorCorner]);
    				} else {
    					instance.setAnchorCorner(anchorCorner);
    				}
    			}
    		}

    		if ($$self.$$.dirty[0] & /*instance, anchorMargin*/ 262656) {
    			if (instance) {
    				instance.setAnchorMargin(anchorMargin);
    			}
    		}
    	};

    	return [
    		open,
    		use,
    		className,
    		style,
    		isStatic,
    		fixed,
    		managed,
    		fullWidth,
    		element,
    		instance,
    		internalClasses,
    		internalStyles,
    		forwardEvents,
    		$$restProps,
    		anchorElement,
    		anchor,
    		quickOpen,
    		anchorCorner,
    		anchorMargin,
    		maxHeight,
    		horizontallyCenteredOnViewport,
    		isOpen,
    		setOpen,
    		setAbsolutePosition,
    		setIsHoisted,
    		isFixed,
    		getElement,
    		_a,
    		_b,
    		_c,
    		$$scope,
    		slots,
    		click_handler,
    		div_binding,
    		keydown_handler
    	];
    }

    class MenuSurface extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(
    			this,
    			options,
    			instance_1$4,
    			create_fragment$b,
    			safe_not_equal,
    			{
    				use: 1,
    				class: 2,
    				style: 3,
    				static: 4,
    				anchor: 15,
    				fixed: 5,
    				open: 0,
    				managed: 6,
    				fullWidth: 7,
    				quickOpen: 16,
    				anchorElement: 14,
    				anchorCorner: 17,
    				anchorMargin: 18,
    				maxHeight: 19,
    				horizontallyCenteredOnViewport: 20,
    				isOpen: 21,
    				setOpen: 22,
    				setAbsolutePosition: 23,
    				setIsHoisted: 24,
    				isFixed: 25,
    				getElement: 26
    			},
    			null,
    			[-1, -1]
    		);

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "MenuSurface",
    			options,
    			id: create_fragment$b.name
    		});
    	}

    	get use() {
    		throw new Error("<MenuSurface>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set use(value) {
    		throw new Error("<MenuSurface>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get class() {
    		throw new Error("<MenuSurface>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set class(value) {
    		throw new Error("<MenuSurface>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get style() {
    		throw new Error("<MenuSurface>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set style(value) {
    		throw new Error("<MenuSurface>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get static() {
    		throw new Error("<MenuSurface>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set static(value) {
    		throw new Error("<MenuSurface>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get anchor() {
    		throw new Error("<MenuSurface>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set anchor(value) {
    		throw new Error("<MenuSurface>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get fixed() {
    		throw new Error("<MenuSurface>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set fixed(value) {
    		throw new Error("<MenuSurface>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get open() {
    		throw new Error("<MenuSurface>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set open(value) {
    		throw new Error("<MenuSurface>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get managed() {
    		throw new Error("<MenuSurface>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set managed(value) {
    		throw new Error("<MenuSurface>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get fullWidth() {
    		throw new Error("<MenuSurface>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set fullWidth(value) {
    		throw new Error("<MenuSurface>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get quickOpen() {
    		throw new Error("<MenuSurface>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set quickOpen(value) {
    		throw new Error("<MenuSurface>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get anchorElement() {
    		throw new Error("<MenuSurface>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set anchorElement(value) {
    		throw new Error("<MenuSurface>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get anchorCorner() {
    		throw new Error("<MenuSurface>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set anchorCorner(value) {
    		throw new Error("<MenuSurface>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get anchorMargin() {
    		throw new Error("<MenuSurface>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set anchorMargin(value) {
    		throw new Error("<MenuSurface>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get maxHeight() {
    		throw new Error("<MenuSurface>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set maxHeight(value) {
    		throw new Error("<MenuSurface>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get horizontallyCenteredOnViewport() {
    		throw new Error("<MenuSurface>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set horizontallyCenteredOnViewport(value) {
    		throw new Error("<MenuSurface>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get isOpen() {
    		return this.$$.ctx[21];
    	}

    	set isOpen(value) {
    		throw new Error("<MenuSurface>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get setOpen() {
    		return this.$$.ctx[22];
    	}

    	set setOpen(value) {
    		throw new Error("<MenuSurface>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get setAbsolutePosition() {
    		return this.$$.ctx[23];
    	}

    	set setAbsolutePosition(value) {
    		throw new Error("<MenuSurface>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get setIsHoisted() {
    		return this.$$.ctx[24];
    	}

    	set setIsHoisted(value) {
    		throw new Error("<MenuSurface>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get isFixed() {
    		return this.$$.ctx[25];
    	}

    	set isFixed(value) {
    		throw new Error("<MenuSurface>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get getElement() {
    		return this.$$.ctx[26];
    	}

    	set getElement(value) {
    		throw new Error("<MenuSurface>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules\@smui\menu\dist\Menu.svelte generated by Svelte v3.46.4 */

    // (1:0) <MenuSurface   bind:this={element}   use={usePass}   class={classMap({     [className]: true,     'mdc-menu': true,   })}   bind:open   on:SMUIMenuSurface:mount={handleMenuSurfaceAccessor}   on:SMUIList:mount={handleListAccessor}   on:SMUIMenuSurface:opened={() =>     instance && instance.handleMenuSurfaceOpened()}   on:keydown={handleKeydown}   on:SMUIList:action={(event) =>     instance &&     instance.handleItemAction(       listAccessor.getOrderedList()[event.detail.index].element     )}   {...$$restProps}>
    function create_default_slot$6(ctx) {
    	let current;
    	const default_slot_template = /*#slots*/ ctx[16].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[21], null);

    	const block = {
    		c: function create() {
    			if (default_slot) default_slot.c();
    		},
    		m: function mount(target, anchor) {
    			if (default_slot) {
    				default_slot.m(target, anchor);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 2097152)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[21],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[21])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[21], dirty, null),
    						null
    					);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$6.name,
    		type: "slot",
    		source: "(1:0) <MenuSurface   bind:this={element}   use={usePass}   class={classMap({     [className]: true,     'mdc-menu': true,   })}   bind:open   on:SMUIMenuSurface:mount={handleMenuSurfaceAccessor}   on:SMUIList:mount={handleListAccessor}   on:SMUIMenuSurface:opened={() =>     instance && instance.handleMenuSurfaceOpened()}   on:keydown={handleKeydown}   on:SMUIList:action={(event) =>     instance &&     instance.handleItemAction(       listAccessor.getOrderedList()[event.detail.index].element     )}   {...$$restProps}>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$a(ctx) {
    	let menusurface;
    	let updating_open;
    	let current;

    	const menusurface_spread_levels = [
    		{ use: /*usePass*/ ctx[5] },
    		{
    			class: classMap({
    				[/*className*/ ctx[1]]: true,
    				'mdc-menu': true
    			})
    		},
    		/*$$restProps*/ ctx[9]
    	];

    	function menusurface_open_binding(value) {
    		/*menusurface_open_binding*/ ctx[18](value);
    	}

    	let menusurface_props = {
    		$$slots: { default: [create_default_slot$6] },
    		$$scope: { ctx }
    	};

    	for (let i = 0; i < menusurface_spread_levels.length; i += 1) {
    		menusurface_props = assign(menusurface_props, menusurface_spread_levels[i]);
    	}

    	if (/*open*/ ctx[0] !== void 0) {
    		menusurface_props.open = /*open*/ ctx[0];
    	}

    	menusurface = new MenuSurface({ props: menusurface_props, $$inline: true });
    	/*menusurface_binding*/ ctx[17](menusurface);
    	binding_callbacks.push(() => bind(menusurface, 'open', menusurface_open_binding));
    	menusurface.$on("SMUIMenuSurface:mount", /*handleMenuSurfaceAccessor*/ ctx[7]);
    	menusurface.$on("SMUIList:mount", /*handleListAccessor*/ ctx[8]);
    	menusurface.$on("SMUIMenuSurface:opened", /*SMUIMenuSurface_opened_handler*/ ctx[19]);
    	menusurface.$on("keydown", /*handleKeydown*/ ctx[6]);
    	menusurface.$on("SMUIList:action", /*SMUIList_action_handler*/ ctx[20]);

    	const block = {
    		c: function create() {
    			create_component(menusurface.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(menusurface, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const menusurface_changes = (dirty & /*usePass, classMap, className, $$restProps*/ 546)
    			? get_spread_update(menusurface_spread_levels, [
    					dirty & /*usePass*/ 32 && { use: /*usePass*/ ctx[5] },
    					dirty & /*classMap, className*/ 2 && {
    						class: classMap({
    							[/*className*/ ctx[1]]: true,
    							'mdc-menu': true
    						})
    					},
    					dirty & /*$$restProps*/ 512 && get_spread_object(/*$$restProps*/ ctx[9])
    				])
    			: {};

    			if (dirty & /*$$scope*/ 2097152) {
    				menusurface_changes.$$scope = { dirty, ctx };
    			}

    			if (!updating_open && dirty & /*open*/ 1) {
    				updating_open = true;
    				menusurface_changes.open = /*open*/ ctx[0];
    				add_flush_callback(() => updating_open = false);
    			}

    			menusurface.$set(menusurface_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(menusurface.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(menusurface.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			/*menusurface_binding*/ ctx[17](null);
    			destroy_component(menusurface, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$a.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance_1$3($$self, $$props, $$invalidate) {
    	let usePass;

    	const omit_props_names = [
    		"use","class","open","isOpen","setOpen","setDefaultFocusState","getSelectedIndex","getElement"
    	];

    	let $$restProps = compute_rest_props($$props, omit_props_names);
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Menu', slots, ['default']);
    	const { closest } = ponyfill;
    	const forwardEvents = forwardEventsBuilder(get_current_component());
    	let { use = [] } = $$props;
    	let { class: className = '' } = $$props;
    	let { open = false } = $$props;
    	let element;
    	let instance;
    	let menuSurfaceAccessor;
    	let listAccessor;

    	onMount(() => {
    		$$invalidate(3, instance = new MDCMenuFoundation({
    				addClassToElementAtIndex: (index, className) => {
    					listAccessor.addClassForElementIndex(index, className);
    				},
    				removeClassFromElementAtIndex: (index, className) => {
    					listAccessor.removeClassForElementIndex(index, className);
    				},
    				addAttributeToElementAtIndex: (index, attr, value) => {
    					listAccessor.setAttributeForElementIndex(index, attr, value);
    				},
    				removeAttributeFromElementAtIndex: (index, attr) => {
    					listAccessor.removeAttributeForElementIndex(index, attr);
    				},
    				getAttributeFromElementAtIndex: (index, attr) => listAccessor.getAttributeFromElementIndex(index, attr),
    				elementContainsClass: (element, className) => element.classList.contains(className),
    				closeSurface: skipRestoreFocus => menuSurfaceAccessor.closeProgrammatic(skipRestoreFocus),
    				getElementIndex: element => listAccessor.getOrderedList().map(accessor => accessor.element).indexOf(element),
    				notifySelected: evtData => dispatch(
    					getElement(),
    					'SMUIMenu:selected',
    					{
    						index: evtData.index,
    						item: listAccessor.getOrderedList()[evtData.index].element
    					},
    					undefined,
    					true
    				),
    				getMenuItemCount: () => listAccessor.items.length,
    				focusItemAtIndex: index => listAccessor.focusItemAtIndex(index),
    				focusListRoot: () => 'focus' in listAccessor.element && listAccessor.element.focus(),
    				isSelectableItemAtIndex: index => !!closest(listAccessor.getOrderedList()[index].element, `.${cssClasses$2.MENU_SELECTION_GROUP}`),
    				getSelectedSiblingOfItemAtIndex: index => {
    					const orderedList = listAccessor.getOrderedList();
    					const selectionGroupEl = closest(orderedList[index].element, `.${cssClasses$2.MENU_SELECTION_GROUP}`);

    					const selectedItemEl = selectionGroupEl === null || selectionGroupEl === void 0
    					? void 0
    					: selectionGroupEl.querySelector(`.${cssClasses$2.MENU_SELECTED_LIST_ITEM}`);

    					return selectedItemEl
    					? orderedList.map(item => item.element).indexOf(selectedItemEl)
    					: -1;
    				}
    			}));

    		dispatch(getElement(), 'SMUIMenu:mount', instance);
    		instance.init();

    		return () => {
    			instance.destroy();
    		};
    	});

    	function handleKeydown(event) {
    		instance && instance.handleKeydown(event);
    	}

    	function handleMenuSurfaceAccessor(event) {
    		if (!menuSurfaceAccessor) {
    			menuSurfaceAccessor = event.detail;
    		}
    	}

    	function handleListAccessor(event) {
    		if (!listAccessor) {
    			$$invalidate(4, listAccessor = event.detail);
    		}
    	}

    	function isOpen() {
    		return open;
    	}

    	function setOpen(value) {
    		$$invalidate(0, open = value);
    	}

    	function setDefaultFocusState(focusState) {
    		instance.setDefaultFocusState(focusState);
    	}

    	function getSelectedIndex() {
    		return instance.getSelectedIndex();
    	}

    	function getElement() {
    		return element.getElement();
    	}

    	function menusurface_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			element = $$value;
    			$$invalidate(2, element);
    		});
    	}

    	function menusurface_open_binding(value) {
    		open = value;
    		$$invalidate(0, open);
    	}

    	const SMUIMenuSurface_opened_handler = () => instance && instance.handleMenuSurfaceOpened();
    	const SMUIList_action_handler = event => instance && instance.handleItemAction(listAccessor.getOrderedList()[event.detail.index].element);

    	$$self.$$set = $$new_props => {
    		$$props = assign(assign({}, $$props), exclude_internal_props($$new_props));
    		$$invalidate(9, $$restProps = compute_rest_props($$props, omit_props_names));
    		if ('use' in $$new_props) $$invalidate(10, use = $$new_props.use);
    		if ('class' in $$new_props) $$invalidate(1, className = $$new_props.class);
    		if ('open' in $$new_props) $$invalidate(0, open = $$new_props.open);
    		if ('$$scope' in $$new_props) $$invalidate(21, $$scope = $$new_props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		MDCMenuFoundation,
    		cssClasses: cssClasses$2,
    		ponyfill,
    		onMount,
    		get_current_component,
    		forwardEventsBuilder,
    		classMap,
    		dispatch,
    		MenuSurface,
    		closest,
    		forwardEvents,
    		use,
    		className,
    		open,
    		element,
    		instance,
    		menuSurfaceAccessor,
    		listAccessor,
    		handleKeydown,
    		handleMenuSurfaceAccessor,
    		handleListAccessor,
    		isOpen,
    		setOpen,
    		setDefaultFocusState,
    		getSelectedIndex,
    		getElement,
    		usePass
    	});

    	$$self.$inject_state = $$new_props => {
    		if ('use' in $$props) $$invalidate(10, use = $$new_props.use);
    		if ('className' in $$props) $$invalidate(1, className = $$new_props.className);
    		if ('open' in $$props) $$invalidate(0, open = $$new_props.open);
    		if ('element' in $$props) $$invalidate(2, element = $$new_props.element);
    		if ('instance' in $$props) $$invalidate(3, instance = $$new_props.instance);
    		if ('menuSurfaceAccessor' in $$props) menuSurfaceAccessor = $$new_props.menuSurfaceAccessor;
    		if ('listAccessor' in $$props) $$invalidate(4, listAccessor = $$new_props.listAccessor);
    		if ('usePass' in $$props) $$invalidate(5, usePass = $$new_props.usePass);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*use*/ 1024) {
    			$$invalidate(5, usePass = [forwardEvents, ...use]);
    		}
    	};

    	return [
    		open,
    		className,
    		element,
    		instance,
    		listAccessor,
    		usePass,
    		handleKeydown,
    		handleMenuSurfaceAccessor,
    		handleListAccessor,
    		$$restProps,
    		use,
    		isOpen,
    		setOpen,
    		setDefaultFocusState,
    		getSelectedIndex,
    		getElement,
    		slots,
    		menusurface_binding,
    		menusurface_open_binding,
    		SMUIMenuSurface_opened_handler,
    		SMUIList_action_handler,
    		$$scope
    	];
    }

    class Menu extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance_1$3, create_fragment$a, safe_not_equal, {
    			use: 10,
    			class: 1,
    			open: 0,
    			isOpen: 11,
    			setOpen: 12,
    			setDefaultFocusState: 13,
    			getSelectedIndex: 14,
    			getElement: 15
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Menu",
    			options,
    			id: create_fragment$a.name
    		});
    	}

    	get use() {
    		throw new Error("<Menu>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set use(value) {
    		throw new Error("<Menu>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get class() {
    		throw new Error("<Menu>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set class(value) {
    		throw new Error("<Menu>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get open() {
    		throw new Error("<Menu>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set open(value) {
    		throw new Error("<Menu>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get isOpen() {
    		return this.$$.ctx[11];
    	}

    	set isOpen(value) {
    		throw new Error("<Menu>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get setOpen() {
    		return this.$$.ctx[12];
    	}

    	set setOpen(value) {
    		throw new Error("<Menu>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get setDefaultFocusState() {
    		return this.$$.ctx[13];
    	}

    	set setDefaultFocusState(value) {
    		throw new Error("<Menu>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get getSelectedIndex() {
    		return this.$$.ctx[14];
    	}

    	set getSelectedIndex(value) {
    		throw new Error("<Menu>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get getElement() {
    		return this.$$.ctx[15];
    	}

    	set getElement(value) {
    		throw new Error("<Menu>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules\@smui\list\dist\List.svelte generated by Svelte v3.46.4 */

    // (1:0) <svelte:component   this={component}   bind:this={element}   use={[forwardEvents, ...use]}   class={classMap({     [className]: true,     'mdc-deprecated-list': true,     'mdc-deprecated-list--non-interactive': nonInteractive,     'mdc-deprecated-list--dense': dense,     'mdc-deprecated-list--textual-list': textualList,     'mdc-deprecated-list--avatar-list': avatarList || selectionDialog,     'mdc-deprecated-list--icon-list': iconList,     'mdc-deprecated-list--image-list': imageList,     'mdc-deprecated-list--thumbnail-list': thumbnailList,     'mdc-deprecated-list--video-list': videoList,     'mdc-deprecated-list--two-line': twoLine,     'smui-list--three-line': threeLine && !twoLine,   })}   {role}   on:keydown={(event) =>     instance &&     instance.handleKeydown(       event,       event.target.classList.contains('mdc-deprecated-list-item'),       getListItemIndex(event.target)     )}   on:focusin={(event) =>     instance && instance.handleFocusIn(getListItemIndex(event.target))}   on:focusout={(event) =>     instance && instance.handleFocusOut(getListItemIndex(event.target))}   on:click={(event) =>     instance &&     instance.handleClick(       getListItemIndex(event.target),       !matches(event.target, 'input[type="checkbox"], input[type="radio"]')     )}   on:SMUIListItem:mount={handleItemMount}   on:SMUIListItem:unmount={handleItemUnmount}   on:SMUI:action={handleAction}   {...$$restProps} >
    function create_default_slot$5(ctx) {
    	let current;
    	const default_slot_template = /*#slots*/ ctx[37].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[43], null);

    	const block = {
    		c: function create() {
    			if (default_slot) default_slot.c();
    		},
    		m: function mount(target, anchor) {
    			if (default_slot) {
    				default_slot.m(target, anchor);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty[1] & /*$$scope*/ 4096)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[43],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[43])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[43], dirty, null),
    						null
    					);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$5.name,
    		type: "slot",
    		source: "(1:0) <svelte:component   this={component}   bind:this={element}   use={[forwardEvents, ...use]}   class={classMap({     [className]: true,     'mdc-deprecated-list': true,     'mdc-deprecated-list--non-interactive': nonInteractive,     'mdc-deprecated-list--dense': dense,     'mdc-deprecated-list--textual-list': textualList,     'mdc-deprecated-list--avatar-list': avatarList || selectionDialog,     'mdc-deprecated-list--icon-list': iconList,     'mdc-deprecated-list--image-list': imageList,     'mdc-deprecated-list--thumbnail-list': thumbnailList,     'mdc-deprecated-list--video-list': videoList,     'mdc-deprecated-list--two-line': twoLine,     'smui-list--three-line': threeLine && !twoLine,   })}   {role}   on:keydown={(event) =>     instance &&     instance.handleKeydown(       event,       event.target.classList.contains('mdc-deprecated-list-item'),       getListItemIndex(event.target)     )}   on:focusin={(event) =>     instance && instance.handleFocusIn(getListItemIndex(event.target))}   on:focusout={(event) =>     instance && instance.handleFocusOut(getListItemIndex(event.target))}   on:click={(event) =>     instance &&     instance.handleClick(       getListItemIndex(event.target),       !matches(event.target, 'input[type=\\\"checkbox\\\"], input[type=\\\"radio\\\"]')     )}   on:SMUIListItem:mount={handleItemMount}   on:SMUIListItem:unmount={handleItemUnmount}   on:SMUI:action={handleAction}   {...$$restProps} >",
    		ctx
    	});

    	return block;
    }

    function create_fragment$9(ctx) {
    	let switch_instance;
    	let switch_instance_anchor;
    	let current;

    	const switch_instance_spread_levels = [
    		{
    			use: [/*forwardEvents*/ ctx[17], .../*use*/ ctx[0]]
    		},
    		{
    			class: classMap({
    				[/*className*/ ctx[1]]: true,
    				'mdc-deprecated-list': true,
    				'mdc-deprecated-list--non-interactive': /*nonInteractive*/ ctx[2],
    				'mdc-deprecated-list--dense': /*dense*/ ctx[3],
    				'mdc-deprecated-list--textual-list': /*textualList*/ ctx[4],
    				'mdc-deprecated-list--avatar-list': /*avatarList*/ ctx[5] || /*selectionDialog*/ ctx[18],
    				'mdc-deprecated-list--icon-list': /*iconList*/ ctx[6],
    				'mdc-deprecated-list--image-list': /*imageList*/ ctx[7],
    				'mdc-deprecated-list--thumbnail-list': /*thumbnailList*/ ctx[8],
    				'mdc-deprecated-list--video-list': /*videoList*/ ctx[9],
    				'mdc-deprecated-list--two-line': /*twoLine*/ ctx[10],
    				'smui-list--three-line': /*threeLine*/ ctx[11] && !/*twoLine*/ ctx[10]
    			})
    		},
    		{ role: /*role*/ ctx[15] },
    		/*$$restProps*/ ctx[23]
    	];

    	var switch_value = /*component*/ ctx[12];

    	function switch_props(ctx) {
    		let switch_instance_props = {
    			$$slots: { default: [create_default_slot$5] },
    			$$scope: { ctx }
    		};

    		for (let i = 0; i < switch_instance_spread_levels.length; i += 1) {
    			switch_instance_props = assign(switch_instance_props, switch_instance_spread_levels[i]);
    		}

    		return {
    			props: switch_instance_props,
    			$$inline: true
    		};
    	}

    	if (switch_value) {
    		switch_instance = new switch_value(switch_props(ctx));
    		/*switch_instance_binding*/ ctx[38](switch_instance);
    		switch_instance.$on("keydown", /*keydown_handler*/ ctx[39]);
    		switch_instance.$on("focusin", /*focusin_handler*/ ctx[40]);
    		switch_instance.$on("focusout", /*focusout_handler*/ ctx[41]);
    		switch_instance.$on("click", /*click_handler*/ ctx[42]);
    		switch_instance.$on("SMUIListItem:mount", /*handleItemMount*/ ctx[19]);
    		switch_instance.$on("SMUIListItem:unmount", /*handleItemUnmount*/ ctx[20]);
    		switch_instance.$on("SMUI:action", /*handleAction*/ ctx[21]);
    	}

    	const block = {
    		c: function create() {
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			switch_instance_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (switch_instance) {
    				mount_component(switch_instance, target, anchor);
    			}

    			insert_dev(target, switch_instance_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const switch_instance_changes = (dirty[0] & /*forwardEvents, use, className, nonInteractive, dense, textualList, avatarList, selectionDialog, iconList, imageList, thumbnailList, videoList, twoLine, threeLine, role, $$restProps*/ 8818687)
    			? get_spread_update(switch_instance_spread_levels, [
    					dirty[0] & /*forwardEvents, use*/ 131073 && {
    						use: [/*forwardEvents*/ ctx[17], .../*use*/ ctx[0]]
    					},
    					dirty[0] & /*className, nonInteractive, dense, textualList, avatarList, selectionDialog, iconList, imageList, thumbnailList, videoList, twoLine, threeLine*/ 266238 && {
    						class: classMap({
    							[/*className*/ ctx[1]]: true,
    							'mdc-deprecated-list': true,
    							'mdc-deprecated-list--non-interactive': /*nonInteractive*/ ctx[2],
    							'mdc-deprecated-list--dense': /*dense*/ ctx[3],
    							'mdc-deprecated-list--textual-list': /*textualList*/ ctx[4],
    							'mdc-deprecated-list--avatar-list': /*avatarList*/ ctx[5] || /*selectionDialog*/ ctx[18],
    							'mdc-deprecated-list--icon-list': /*iconList*/ ctx[6],
    							'mdc-deprecated-list--image-list': /*imageList*/ ctx[7],
    							'mdc-deprecated-list--thumbnail-list': /*thumbnailList*/ ctx[8],
    							'mdc-deprecated-list--video-list': /*videoList*/ ctx[9],
    							'mdc-deprecated-list--two-line': /*twoLine*/ ctx[10],
    							'smui-list--three-line': /*threeLine*/ ctx[11] && !/*twoLine*/ ctx[10]
    						})
    					},
    					dirty[0] & /*role*/ 32768 && { role: /*role*/ ctx[15] },
    					dirty[0] & /*$$restProps*/ 8388608 && get_spread_object(/*$$restProps*/ ctx[23])
    				])
    			: {};

    			if (dirty[1] & /*$$scope*/ 4096) {
    				switch_instance_changes.$$scope = { dirty, ctx };
    			}

    			if (switch_value !== (switch_value = /*component*/ ctx[12])) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;

    					transition_out(old_component.$$.fragment, 1, 0, () => {
    						destroy_component(old_component, 1);
    					});

    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = new switch_value(switch_props(ctx));
    					/*switch_instance_binding*/ ctx[38](switch_instance);
    					switch_instance.$on("keydown", /*keydown_handler*/ ctx[39]);
    					switch_instance.$on("focusin", /*focusin_handler*/ ctx[40]);
    					switch_instance.$on("focusout", /*focusout_handler*/ ctx[41]);
    					switch_instance.$on("click", /*click_handler*/ ctx[42]);
    					switch_instance.$on("SMUIListItem:mount", /*handleItemMount*/ ctx[19]);
    					switch_instance.$on("SMUIListItem:unmount", /*handleItemUnmount*/ ctx[20]);
    					switch_instance.$on("SMUI:action", /*handleAction*/ ctx[21]);
    					create_component(switch_instance.$$.fragment);
    					transition_in(switch_instance.$$.fragment, 1);
    					mount_component(switch_instance, switch_instance_anchor.parentNode, switch_instance_anchor);
    				} else {
    					switch_instance = null;
    				}
    			} else if (switch_value) {
    				switch_instance.$set(switch_instance_changes);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			/*switch_instance_binding*/ ctx[38](null);
    			if (detaching) detach_dev(switch_instance_anchor);
    			if (switch_instance) destroy_component(switch_instance, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$9.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance_1$2($$self, $$props, $$invalidate) {
    	const omit_props_names = [
    		"use","class","nonInteractive","dense","textualList","avatarList","iconList","imageList","thumbnailList","videoList","twoLine","threeLine","vertical","wrapFocus","singleSelection","selectedIndex","radioList","checkList","hasTypeahead","component","layout","setEnabled","getTypeaheadInProgress","getSelectedIndex","getFocusedItemIndex","getElement"
    	];

    	let $$restProps = compute_rest_props($$props, omit_props_names);
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('List', slots, ['default']);
    	var _a;
    	const { closest, matches } = ponyfill;
    	const forwardEvents = forwardEventsBuilder(get_current_component());
    	let { use = [] } = $$props;
    	let { class: className = '' } = $$props;
    	let { nonInteractive = false } = $$props;
    	let { dense = false } = $$props;
    	let { textualList = false } = $$props;
    	let { avatarList = false } = $$props;
    	let { iconList = false } = $$props;
    	let { imageList = false } = $$props;
    	let { thumbnailList = false } = $$props;
    	let { videoList = false } = $$props;
    	let { twoLine = false } = $$props;
    	let { threeLine = false } = $$props;
    	let { vertical = true } = $$props;

    	let { wrapFocus = (_a = getContext('SMUI:list:wrapFocus')) !== null && _a !== void 0
    	? _a
    	: false } = $$props;

    	let { singleSelection = false } = $$props;
    	let { selectedIndex = -1 } = $$props;
    	let { radioList = false } = $$props;
    	let { checkList = false } = $$props;
    	let { hasTypeahead = false } = $$props;
    	let element;
    	let instance;
    	let items = [];
    	let role = getContext('SMUI:list:role');
    	let nav = getContext('SMUI:list:nav');
    	const itemAccessorMap = new WeakMap();
    	let selectionDialog = getContext('SMUI:dialog:selection');
    	let addLayoutListener = getContext('SMUI:addLayoutListener');
    	let removeLayoutListener;
    	let { component = nav ? Nav : Ul } = $$props;
    	setContext('SMUI:list:nonInteractive', nonInteractive);
    	setContext('SMUI:separator:context', 'list');

    	if (!role) {
    		if (singleSelection) {
    			role = 'listbox';
    			setContext('SMUI:list:item:role', 'option');
    		} else if (radioList) {
    			role = 'radiogroup';
    			setContext('SMUI:list:item:role', 'radio');
    		} else if (checkList) {
    			role = 'group';
    			setContext('SMUI:list:item:role', 'checkbox');
    		} else {
    			role = 'list';
    			setContext('SMUI:list:item:role', undefined);
    		}
    	}

    	if (addLayoutListener) {
    		removeLayoutListener = addLayoutListener(layout);
    	}

    	onMount(() => {
    		$$invalidate(13, instance = new MDCListFoundation({
    				addClassForElementIndex,
    				focusItemAtIndex,
    				getAttributeForElementIndex: (index, name) => {
    					var _a, _b;

    					return (_b = (_a = getOrderedList()[index]) === null || _a === void 0
    					? void 0
    					: _a.getAttr(name)) !== null && _b !== void 0
    					? _b
    					: null;
    				},
    				getFocusedElementIndex: () => document.activeElement
    				? getOrderedList().map(accessor => accessor.element).indexOf(document.activeElement)
    				: -1,
    				getListItemCount: () => items.length,
    				getPrimaryTextAtIndex,
    				hasCheckboxAtIndex: index => {
    					var _a, _b;

    					return (_b = (_a = getOrderedList()[index]) === null || _a === void 0
    					? void 0
    					: _a.hasCheckbox) !== null && _b !== void 0
    					? _b
    					: false;
    				},
    				hasRadioAtIndex: index => {
    					var _a, _b;

    					return (_b = (_a = getOrderedList()[index]) === null || _a === void 0
    					? void 0
    					: _a.hasRadio) !== null && _b !== void 0
    					? _b
    					: false;
    				},
    				isCheckboxCheckedAtIndex: index => {
    					var _a;
    					const listItem = getOrderedList()[index];

    					return (_a = (listItem === null || listItem === void 0
    					? void 0
    					: listItem.hasCheckbox) && listItem.checked) !== null && _a !== void 0
    					? _a
    					: false;
    				},
    				isFocusInsideList: () => element != null && getElement() !== document.activeElement && getElement().contains(document.activeElement),
    				isRootFocused: () => element != null && document.activeElement === getElement(),
    				listItemAtIndexHasClass,
    				notifyAction: index => {
    					$$invalidate(24, selectedIndex = index);

    					if (element != null) {
    						dispatch(getElement(), 'SMUIList:action', { index }, undefined, true);
    					}
    				},
    				removeClassForElementIndex,
    				setAttributeForElementIndex,
    				setCheckedCheckboxOrRadioAtIndex: (index, isChecked) => {
    					getOrderedList()[index].checked = isChecked;
    				},
    				setTabIndexForListItemChildren: (listItemIndex, tabIndexValue) => {
    					const listItem = getOrderedList()[listItemIndex];
    					const selector = 'button:not(:disabled), a';

    					Array.prototype.forEach.call(listItem.element.querySelectorAll(selector), el => {
    						el.setAttribute('tabindex', tabIndexValue);
    					});
    				}
    			}));

    		const accessor = {
    			get element() {
    				return getElement();
    			},
    			get items() {
    				return items;
    			},
    			get typeaheadInProgress() {
    				return instance.isTypeaheadInProgress();
    			},
    			typeaheadMatchItem(nextChar, startingIndex) {
    				return instance.typeaheadMatchItem(nextChar, startingIndex, /** skipFocus */
    				true);
    			},
    			getOrderedList,
    			focusItemAtIndex,
    			addClassForElementIndex,
    			removeClassForElementIndex,
    			setAttributeForElementIndex,
    			removeAttributeForElementIndex,
    			getAttributeFromElementIndex,
    			getPrimaryTextAtIndex
    		};

    		dispatch(getElement(), 'SMUIList:mount', accessor);
    		instance.init();

    		return () => {
    			instance.destroy();
    		};
    	});

    	onDestroy(() => {
    		if (removeLayoutListener) {
    			removeLayoutListener();
    		}
    	});

    	function handleItemMount(event) {
    		items.push(event.detail);
    		itemAccessorMap.set(event.detail.element, event.detail);

    		if (singleSelection && event.detail.selected) {
    			$$invalidate(24, selectedIndex = getListItemIndex(event.detail.element));
    		}

    		event.stopPropagation();
    	}

    	function handleItemUnmount(event) {
    		var _a;

    		const idx = (_a = event.detail && items.indexOf(event.detail)) !== null && _a !== void 0
    		? _a
    		: -1;

    		if (idx !== -1) {
    			items.splice(idx, 1);
    			items = items;
    			itemAccessorMap.delete(event.detail.element);
    		}

    		event.stopPropagation();
    	}

    	function handleAction(event) {
    		if (radioList || checkList) {
    			const index = getListItemIndex(event.target);

    			if (index !== -1) {
    				const item = getOrderedList()[index];

    				if (item && (radioList && !item.checked || checkList)) {
    					item.checked = !item.checked;
    					item.activateRipple();

    					window.requestAnimationFrame(() => {
    						item.deactivateRipple();
    					});
    				}
    			}
    		}
    	}

    	function getOrderedList() {
    		if (element == null) {
    			return [];
    		}

    		return [...getElement().children].map(element => itemAccessorMap.get(element)).filter(accessor => accessor && accessor._smui_list_item_accessor);
    	}

    	function focusItemAtIndex(index) {
    		const accessor = getOrderedList()[index];
    		accessor && 'focus' in accessor.element && accessor.element.focus();
    	}

    	function listItemAtIndexHasClass(index, className) {
    		var _a;
    		const accessor = getOrderedList()[index];

    		return (_a = accessor && accessor.hasClass(className)) !== null && _a !== void 0
    		? _a
    		: false;
    	}

    	function addClassForElementIndex(index, className) {
    		const accessor = getOrderedList()[index];
    		accessor && accessor.addClass(className);
    	}

    	function removeClassForElementIndex(index, className) {
    		const accessor = getOrderedList()[index];
    		accessor && accessor.removeClass(className);
    	}

    	function setAttributeForElementIndex(index, name, value) {
    		const accessor = getOrderedList()[index];
    		accessor && accessor.addAttr(name, value);
    	}

    	function removeAttributeForElementIndex(index, name) {
    		const accessor = getOrderedList()[index];
    		accessor && accessor.removeAttr(name);
    	}

    	function getAttributeFromElementIndex(index, name) {
    		const accessor = getOrderedList()[index];

    		if (accessor) {
    			return accessor.getAttr(name);
    		} else {
    			return null;
    		}
    	}

    	function getPrimaryTextAtIndex(index) {
    		var _a;
    		const accessor = getOrderedList()[index];

    		return (_a = accessor && accessor.getPrimaryText()) !== null && _a !== void 0
    		? _a
    		: '';
    	}

    	function getListItemIndex(element) {
    		const nearestParent = closest(element, '.mdc-deprecated-list-item, .mdc-deprecated-list');

    		// Get the index of the element if it is a list item.
    		if (nearestParent && matches(nearestParent, '.mdc-deprecated-list-item')) {
    			return getOrderedList().map(item => item === null || item === void 0 ? void 0 : item.element).indexOf(nearestParent);
    		}

    		return -1;
    	}

    	function layout() {
    		return instance.layout();
    	}

    	function setEnabled(itemIndex, isEnabled) {
    		return instance.setEnabled(itemIndex, isEnabled);
    	}

    	function getTypeaheadInProgress() {
    		return instance.isTypeaheadInProgress();
    	}

    	function getSelectedIndex() {
    		return instance.getSelectedIndex();
    	}

    	function getFocusedItemIndex() {
    		return instance.getFocusedItemIndex();
    	}

    	function getElement() {
    		return element.getElement();
    	}

    	function switch_instance_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			element = $$value;
    			$$invalidate(14, element);
    		});
    	}

    	const keydown_handler = event => instance && instance.handleKeydown(event, event.target.classList.contains('mdc-deprecated-list-item'), getListItemIndex(event.target));
    	const focusin_handler = event => instance && instance.handleFocusIn(getListItemIndex(event.target));
    	const focusout_handler = event => instance && instance.handleFocusOut(getListItemIndex(event.target));
    	const click_handler = event => instance && instance.handleClick(getListItemIndex(event.target), !matches(event.target, 'input[type="checkbox"], input[type="radio"]'));

    	$$self.$$set = $$new_props => {
    		$$props = assign(assign({}, $$props), exclude_internal_props($$new_props));
    		$$invalidate(23, $$restProps = compute_rest_props($$props, omit_props_names));
    		if ('use' in $$new_props) $$invalidate(0, use = $$new_props.use);
    		if ('class' in $$new_props) $$invalidate(1, className = $$new_props.class);
    		if ('nonInteractive' in $$new_props) $$invalidate(2, nonInteractive = $$new_props.nonInteractive);
    		if ('dense' in $$new_props) $$invalidate(3, dense = $$new_props.dense);
    		if ('textualList' in $$new_props) $$invalidate(4, textualList = $$new_props.textualList);
    		if ('avatarList' in $$new_props) $$invalidate(5, avatarList = $$new_props.avatarList);
    		if ('iconList' in $$new_props) $$invalidate(6, iconList = $$new_props.iconList);
    		if ('imageList' in $$new_props) $$invalidate(7, imageList = $$new_props.imageList);
    		if ('thumbnailList' in $$new_props) $$invalidate(8, thumbnailList = $$new_props.thumbnailList);
    		if ('videoList' in $$new_props) $$invalidate(9, videoList = $$new_props.videoList);
    		if ('twoLine' in $$new_props) $$invalidate(10, twoLine = $$new_props.twoLine);
    		if ('threeLine' in $$new_props) $$invalidate(11, threeLine = $$new_props.threeLine);
    		if ('vertical' in $$new_props) $$invalidate(25, vertical = $$new_props.vertical);
    		if ('wrapFocus' in $$new_props) $$invalidate(26, wrapFocus = $$new_props.wrapFocus);
    		if ('singleSelection' in $$new_props) $$invalidate(27, singleSelection = $$new_props.singleSelection);
    		if ('selectedIndex' in $$new_props) $$invalidate(24, selectedIndex = $$new_props.selectedIndex);
    		if ('radioList' in $$new_props) $$invalidate(28, radioList = $$new_props.radioList);
    		if ('checkList' in $$new_props) $$invalidate(29, checkList = $$new_props.checkList);
    		if ('hasTypeahead' in $$new_props) $$invalidate(30, hasTypeahead = $$new_props.hasTypeahead);
    		if ('component' in $$new_props) $$invalidate(12, component = $$new_props.component);
    		if ('$$scope' in $$new_props) $$invalidate(43, $$scope = $$new_props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		_a,
    		MDCListFoundation,
    		ponyfill,
    		onMount,
    		onDestroy,
    		getContext,
    		setContext,
    		get_current_component,
    		forwardEventsBuilder,
    		classMap,
    		dispatch,
    		Ul,
    		Nav,
    		closest,
    		matches,
    		forwardEvents,
    		use,
    		className,
    		nonInteractive,
    		dense,
    		textualList,
    		avatarList,
    		iconList,
    		imageList,
    		thumbnailList,
    		videoList,
    		twoLine,
    		threeLine,
    		vertical,
    		wrapFocus,
    		singleSelection,
    		selectedIndex,
    		radioList,
    		checkList,
    		hasTypeahead,
    		element,
    		instance,
    		items,
    		role,
    		nav,
    		itemAccessorMap,
    		selectionDialog,
    		addLayoutListener,
    		removeLayoutListener,
    		component,
    		handleItemMount,
    		handleItemUnmount,
    		handleAction,
    		getOrderedList,
    		focusItemAtIndex,
    		listItemAtIndexHasClass,
    		addClassForElementIndex,
    		removeClassForElementIndex,
    		setAttributeForElementIndex,
    		removeAttributeForElementIndex,
    		getAttributeFromElementIndex,
    		getPrimaryTextAtIndex,
    		getListItemIndex,
    		layout,
    		setEnabled,
    		getTypeaheadInProgress,
    		getSelectedIndex,
    		getFocusedItemIndex,
    		getElement
    	});

    	$$self.$inject_state = $$new_props => {
    		if ('_a' in $$props) _a = $$new_props._a;
    		if ('use' in $$props) $$invalidate(0, use = $$new_props.use);
    		if ('className' in $$props) $$invalidate(1, className = $$new_props.className);
    		if ('nonInteractive' in $$props) $$invalidate(2, nonInteractive = $$new_props.nonInteractive);
    		if ('dense' in $$props) $$invalidate(3, dense = $$new_props.dense);
    		if ('textualList' in $$props) $$invalidate(4, textualList = $$new_props.textualList);
    		if ('avatarList' in $$props) $$invalidate(5, avatarList = $$new_props.avatarList);
    		if ('iconList' in $$props) $$invalidate(6, iconList = $$new_props.iconList);
    		if ('imageList' in $$props) $$invalidate(7, imageList = $$new_props.imageList);
    		if ('thumbnailList' in $$props) $$invalidate(8, thumbnailList = $$new_props.thumbnailList);
    		if ('videoList' in $$props) $$invalidate(9, videoList = $$new_props.videoList);
    		if ('twoLine' in $$props) $$invalidate(10, twoLine = $$new_props.twoLine);
    		if ('threeLine' in $$props) $$invalidate(11, threeLine = $$new_props.threeLine);
    		if ('vertical' in $$props) $$invalidate(25, vertical = $$new_props.vertical);
    		if ('wrapFocus' in $$props) $$invalidate(26, wrapFocus = $$new_props.wrapFocus);
    		if ('singleSelection' in $$props) $$invalidate(27, singleSelection = $$new_props.singleSelection);
    		if ('selectedIndex' in $$props) $$invalidate(24, selectedIndex = $$new_props.selectedIndex);
    		if ('radioList' in $$props) $$invalidate(28, radioList = $$new_props.radioList);
    		if ('checkList' in $$props) $$invalidate(29, checkList = $$new_props.checkList);
    		if ('hasTypeahead' in $$props) $$invalidate(30, hasTypeahead = $$new_props.hasTypeahead);
    		if ('element' in $$props) $$invalidate(14, element = $$new_props.element);
    		if ('instance' in $$props) $$invalidate(13, instance = $$new_props.instance);
    		if ('items' in $$props) items = $$new_props.items;
    		if ('role' in $$props) $$invalidate(15, role = $$new_props.role);
    		if ('nav' in $$props) nav = $$new_props.nav;
    		if ('selectionDialog' in $$props) $$invalidate(18, selectionDialog = $$new_props.selectionDialog);
    		if ('addLayoutListener' in $$props) addLayoutListener = $$new_props.addLayoutListener;
    		if ('removeLayoutListener' in $$props) removeLayoutListener = $$new_props.removeLayoutListener;
    		if ('component' in $$props) $$invalidate(12, component = $$new_props.component);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty[0] & /*instance, vertical*/ 33562624) {
    			if (instance) {
    				instance.setVerticalOrientation(vertical);
    			}
    		}

    		if ($$self.$$.dirty[0] & /*instance, wrapFocus*/ 67117056) {
    			if (instance) {
    				instance.setWrapFocus(wrapFocus);
    			}
    		}

    		if ($$self.$$.dirty[0] & /*instance, hasTypeahead*/ 1073750016) {
    			if (instance) {
    				instance.setHasTypeahead(hasTypeahead);
    			}
    		}

    		if ($$self.$$.dirty[0] & /*instance, singleSelection*/ 134225920) {
    			if (instance) {
    				instance.setSingleSelection(singleSelection);
    			}
    		}

    		if ($$self.$$.dirty[0] & /*instance, singleSelection, selectedIndex*/ 151003136) {
    			if (instance && singleSelection && getSelectedIndex() !== selectedIndex) {
    				instance.setSelectedIndex(selectedIndex);
    			}
    		}
    	};

    	return [
    		use,
    		className,
    		nonInteractive,
    		dense,
    		textualList,
    		avatarList,
    		iconList,
    		imageList,
    		thumbnailList,
    		videoList,
    		twoLine,
    		threeLine,
    		component,
    		instance,
    		element,
    		role,
    		matches,
    		forwardEvents,
    		selectionDialog,
    		handleItemMount,
    		handleItemUnmount,
    		handleAction,
    		getListItemIndex,
    		$$restProps,
    		selectedIndex,
    		vertical,
    		wrapFocus,
    		singleSelection,
    		radioList,
    		checkList,
    		hasTypeahead,
    		layout,
    		setEnabled,
    		getTypeaheadInProgress,
    		getSelectedIndex,
    		getFocusedItemIndex,
    		getElement,
    		slots,
    		switch_instance_binding,
    		keydown_handler,
    		focusin_handler,
    		focusout_handler,
    		click_handler,
    		$$scope
    	];
    }

    class List extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(
    			this,
    			options,
    			instance_1$2,
    			create_fragment$9,
    			safe_not_equal,
    			{
    				use: 0,
    				class: 1,
    				nonInteractive: 2,
    				dense: 3,
    				textualList: 4,
    				avatarList: 5,
    				iconList: 6,
    				imageList: 7,
    				thumbnailList: 8,
    				videoList: 9,
    				twoLine: 10,
    				threeLine: 11,
    				vertical: 25,
    				wrapFocus: 26,
    				singleSelection: 27,
    				selectedIndex: 24,
    				radioList: 28,
    				checkList: 29,
    				hasTypeahead: 30,
    				component: 12,
    				layout: 31,
    				setEnabled: 32,
    				getTypeaheadInProgress: 33,
    				getSelectedIndex: 34,
    				getFocusedItemIndex: 35,
    				getElement: 36
    			},
    			null,
    			[-1, -1]
    		);

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "List",
    			options,
    			id: create_fragment$9.name
    		});
    	}

    	get use() {
    		throw new Error("<List>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set use(value) {
    		throw new Error("<List>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get class() {
    		throw new Error("<List>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set class(value) {
    		throw new Error("<List>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get nonInteractive() {
    		throw new Error("<List>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set nonInteractive(value) {
    		throw new Error("<List>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get dense() {
    		throw new Error("<List>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set dense(value) {
    		throw new Error("<List>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get textualList() {
    		throw new Error("<List>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set textualList(value) {
    		throw new Error("<List>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get avatarList() {
    		throw new Error("<List>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set avatarList(value) {
    		throw new Error("<List>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get iconList() {
    		throw new Error("<List>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set iconList(value) {
    		throw new Error("<List>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get imageList() {
    		throw new Error("<List>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set imageList(value) {
    		throw new Error("<List>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get thumbnailList() {
    		throw new Error("<List>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set thumbnailList(value) {
    		throw new Error("<List>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get videoList() {
    		throw new Error("<List>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set videoList(value) {
    		throw new Error("<List>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get twoLine() {
    		throw new Error("<List>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set twoLine(value) {
    		throw new Error("<List>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get threeLine() {
    		throw new Error("<List>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set threeLine(value) {
    		throw new Error("<List>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get vertical() {
    		throw new Error("<List>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set vertical(value) {
    		throw new Error("<List>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get wrapFocus() {
    		throw new Error("<List>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set wrapFocus(value) {
    		throw new Error("<List>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get singleSelection() {
    		throw new Error("<List>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set singleSelection(value) {
    		throw new Error("<List>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get selectedIndex() {
    		throw new Error("<List>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set selectedIndex(value) {
    		throw new Error("<List>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get radioList() {
    		throw new Error("<List>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set radioList(value) {
    		throw new Error("<List>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get checkList() {
    		throw new Error("<List>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set checkList(value) {
    		throw new Error("<List>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get hasTypeahead() {
    		throw new Error("<List>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set hasTypeahead(value) {
    		throw new Error("<List>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get component() {
    		throw new Error("<List>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set component(value) {
    		throw new Error("<List>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get layout() {
    		return this.$$.ctx[31];
    	}

    	set layout(value) {
    		throw new Error("<List>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get setEnabled() {
    		return this.$$.ctx[32];
    	}

    	set setEnabled(value) {
    		throw new Error("<List>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get getTypeaheadInProgress() {
    		return this.$$.ctx[33];
    	}

    	set getTypeaheadInProgress(value) {
    		throw new Error("<List>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get getSelectedIndex() {
    		return this.$$.ctx[34];
    	}

    	set getSelectedIndex(value) {
    		throw new Error("<List>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get getFocusedItemIndex() {
    		return this.$$.ctx[35];
    	}

    	set getFocusedItemIndex(value) {
    		throw new Error("<List>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get getElement() {
    		return this.$$.ctx[36];
    	}

    	set getElement(value) {
    		throw new Error("<List>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules\@smui\list\dist\Item.svelte generated by Svelte v3.46.4 */
    const file$8 = "node_modules\\@smui\\list\\dist\\Item.svelte";

    // (57:3) {#if ripple}
    function create_if_block$4(ctx) {
    	let span;

    	const block = {
    		c: function create() {
    			span = element("span");
    			attr_dev(span, "class", "mdc-deprecated-list-item__ripple");
    			add_location(span, file$8, 56, 15, 1701);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$4.name,
    		type: "if",
    		source: "(57:3) {#if ripple}",
    		ctx
    	});

    	return block;
    }

    // (1:0) <svelte:component   this={component}   bind:this={element}   use={[     ...(nonInteractive       ? []       : [           [             Ripple,             {               ripple: !input,               unbounded: false,               color:                 (activated || selected) && color == null ? 'primary' : color,               disabled,               addClass,               removeClass,               addStyle,             },           ],         ]),     forwardEvents,     ...use,   ]}   class={classMap({     [className]: true,     'mdc-deprecated-list-item': true,     'mdc-deprecated-list-item--activated': activated,     'mdc-deprecated-list-item--selected': selected,     'mdc-deprecated-list-item--disabled': disabled,     'mdc-menu-item--selected': !nav && role === 'menuitem' && selected,     'smui-menu-item--non-interactive': nonInteractive,     ...internalClasses,   })}   style={Object.entries(internalStyles)     .map(([name, value]) => `${name}: ${value};`)     .concat([style])     .join(' ')}   {...nav && activated ? { 'aria-current': 'page' } : {}}   {...!nav ? { role } : {}}   {...!nav && role === 'option'     ? { 'aria-selected': selected ? 'true' : 'false' }     : {}}   {...!nav && (role === 'radio' || role === 'checkbox')     ? { 'aria-checked': input && input.checked ? 'true' : 'false' }     : {}}   {...!nav ? { 'aria-disabled': disabled ? 'true' : 'false' } : {}}   data-menu-item-skip-restore-focus={skipRestoreFocus || undefined}   {tabindex}   on:click={action}   on:keydown={handleKeydown}   on:SMUIGenericInput:mount={handleInputMount}   on:SMUIGenericInput:unmount={() => (input = undefined)}   {href}   {...internalAttrs}   {...$$restProps}   >
    function create_default_slot$4(ctx) {
    	let if_block_anchor;
    	let current;
    	let if_block = /*ripple*/ ctx[7] && create_if_block$4(ctx);
    	const default_slot_template = /*#slots*/ ctx[32].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[35], null);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    			if (default_slot) default_slot.c();
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);

    			if (default_slot) {
    				default_slot.m(target, anchor);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (/*ripple*/ ctx[7]) {
    				if (if_block) ; else {
    					if_block = create_if_block$4(ctx);
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}

    			if (default_slot) {
    				if (default_slot.p && (!current || dirty[1] & /*$$scope*/ 16)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[35],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[35])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[35], dirty, null),
    						null
    					);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$4.name,
    		type: "slot",
    		source: "(1:0) <svelte:component   this={component}   bind:this={element}   use={[     ...(nonInteractive       ? []       : [           [             Ripple,             {               ripple: !input,               unbounded: false,               color:                 (activated || selected) && color == null ? 'primary' : color,               disabled,               addClass,               removeClass,               addStyle,             },           ],         ]),     forwardEvents,     ...use,   ]}   class={classMap({     [className]: true,     'mdc-deprecated-list-item': true,     'mdc-deprecated-list-item--activated': activated,     'mdc-deprecated-list-item--selected': selected,     'mdc-deprecated-list-item--disabled': disabled,     'mdc-menu-item--selected': !nav && role === 'menuitem' && selected,     'smui-menu-item--non-interactive': nonInteractive,     ...internalClasses,   })}   style={Object.entries(internalStyles)     .map(([name, value]) => `${name}: ${value};`)     .concat([style])     .join(' ')}   {...nav && activated ? { 'aria-current': 'page' } : {}}   {...!nav ? { role } : {}}   {...!nav && role === 'option'     ? { 'aria-selected': selected ? 'true' : 'false' }     : {}}   {...!nav && (role === 'radio' || role === 'checkbox')     ? { 'aria-checked': input && input.checked ? 'true' : 'false' }     : {}}   {...!nav ? { 'aria-disabled': disabled ? 'true' : 'false' } : {}}   data-menu-item-skip-restore-focus={skipRestoreFocus || undefined}   {tabindex}   on:click={action}   on:keydown={handleKeydown}   on:SMUIGenericInput:mount={handleInputMount}   on:SMUIGenericInput:unmount={() => (input = undefined)}   {href}   {...internalAttrs}   {...$$restProps}   >",
    		ctx
    	});

    	return block;
    }

    function create_fragment$8(ctx) {
    	let switch_instance;
    	let switch_instance_anchor;
    	let current;

    	const switch_instance_spread_levels = [
    		{
    			use: [
    				.../*nonInteractive*/ ctx[6]
    				? []
    				: [
    						[
    							Ripple,
    							{
    								ripple: !/*input*/ ctx[14],
    								unbounded: false,
    								color: (/*activated*/ ctx[1] || /*selected*/ ctx[0]) && /*color*/ ctx[5] == null
    								? 'primary'
    								: /*color*/ ctx[5],
    								disabled: /*disabled*/ ctx[9],
    								addClass: /*addClass*/ ctx[22],
    								removeClass: /*removeClass*/ ctx[23],
    								addStyle: /*addStyle*/ ctx[24]
    							}
    						]
    					],
    				/*forwardEvents*/ ctx[20],
    				.../*use*/ ctx[2]
    			]
    		},
    		{
    			class: classMap({
    				[/*className*/ ctx[3]]: true,
    				'mdc-deprecated-list-item': true,
    				'mdc-deprecated-list-item--activated': /*activated*/ ctx[1],
    				'mdc-deprecated-list-item--selected': /*selected*/ ctx[0],
    				'mdc-deprecated-list-item--disabled': /*disabled*/ ctx[9],
    				'mdc-menu-item--selected': !/*nav*/ ctx[21] && /*role*/ ctx[8] === 'menuitem' && /*selected*/ ctx[0],
    				'smui-menu-item--non-interactive': /*nonInteractive*/ ctx[6],
    				.../*internalClasses*/ ctx[16]
    			})
    		},
    		{
    			style: Object.entries(/*internalStyles*/ ctx[17]).map(func$2).concat([/*style*/ ctx[4]]).join(' ')
    		},
    		/*nav*/ ctx[21] && /*activated*/ ctx[1]
    		? { 'aria-current': 'page' }
    		: {},
    		!/*nav*/ ctx[21] ? { role: /*role*/ ctx[8] } : {},
    		!/*nav*/ ctx[21] && /*role*/ ctx[8] === 'option'
    		? {
    				'aria-selected': /*selected*/ ctx[0] ? 'true' : 'false'
    			}
    		: {},
    		!/*nav*/ ctx[21] && (/*role*/ ctx[8] === 'radio' || /*role*/ ctx[8] === 'checkbox')
    		? {
    				'aria-checked': /*input*/ ctx[14] && /*input*/ ctx[14].checked
    				? 'true'
    				: 'false'
    			}
    		: {},
    		!/*nav*/ ctx[21]
    		? {
    				'aria-disabled': /*disabled*/ ctx[9] ? 'true' : 'false'
    			}
    		: {},
    		{
    			"data-menu-item-skip-restore-focus": /*skipRestoreFocus*/ ctx[10] || undefined
    		},
    		{ tabindex: /*tabindex*/ ctx[19] },
    		{ href: /*href*/ ctx[11] },
    		/*internalAttrs*/ ctx[18],
    		/*$$restProps*/ ctx[27]
    	];

    	var switch_value = /*component*/ ctx[12];

    	function switch_props(ctx) {
    		let switch_instance_props = {
    			$$slots: { default: [create_default_slot$4] },
    			$$scope: { ctx }
    		};

    		for (let i = 0; i < switch_instance_spread_levels.length; i += 1) {
    			switch_instance_props = assign(switch_instance_props, switch_instance_spread_levels[i]);
    		}

    		return {
    			props: switch_instance_props,
    			$$inline: true
    		};
    	}

    	if (switch_value) {
    		switch_instance = new switch_value(switch_props(ctx));
    		/*switch_instance_binding*/ ctx[33](switch_instance);
    		switch_instance.$on("click", /*action*/ ctx[13]);
    		switch_instance.$on("keydown", /*handleKeydown*/ ctx[25]);
    		switch_instance.$on("SMUIGenericInput:mount", /*handleInputMount*/ ctx[26]);
    		switch_instance.$on("SMUIGenericInput:unmount", /*SMUIGenericInput_unmount_handler*/ ctx[34]);
    	}

    	const block = {
    		c: function create() {
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			switch_instance_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (switch_instance) {
    				mount_component(switch_instance, target, anchor);
    			}

    			insert_dev(target, switch_instance_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const switch_instance_changes = (dirty[0] & /*nonInteractive, input, activated, selected, color, disabled, addClass, removeClass, addStyle, forwardEvents, use, className, nav, role, internalClasses, internalStyles, style, skipRestoreFocus, tabindex, href, internalAttrs, $$restProps*/ 167726975)
    			? get_spread_update(switch_instance_spread_levels, [
    					dirty[0] & /*nonInteractive, input, activated, selected, color, disabled, addClass, removeClass, addStyle, forwardEvents, use*/ 30425703 && {
    						use: [
    							.../*nonInteractive*/ ctx[6]
    							? []
    							: [
    									[
    										Ripple,
    										{
    											ripple: !/*input*/ ctx[14],
    											unbounded: false,
    											color: (/*activated*/ ctx[1] || /*selected*/ ctx[0]) && /*color*/ ctx[5] == null
    											? 'primary'
    											: /*color*/ ctx[5],
    											disabled: /*disabled*/ ctx[9],
    											addClass: /*addClass*/ ctx[22],
    											removeClass: /*removeClass*/ ctx[23],
    											addStyle: /*addStyle*/ ctx[24]
    										}
    									]
    								],
    							/*forwardEvents*/ ctx[20],
    							.../*use*/ ctx[2]
    						]
    					},
    					dirty[0] & /*className, activated, selected, disabled, nav, role, nonInteractive, internalClasses*/ 2163531 && {
    						class: classMap({
    							[/*className*/ ctx[3]]: true,
    							'mdc-deprecated-list-item': true,
    							'mdc-deprecated-list-item--activated': /*activated*/ ctx[1],
    							'mdc-deprecated-list-item--selected': /*selected*/ ctx[0],
    							'mdc-deprecated-list-item--disabled': /*disabled*/ ctx[9],
    							'mdc-menu-item--selected': !/*nav*/ ctx[21] && /*role*/ ctx[8] === 'menuitem' && /*selected*/ ctx[0],
    							'smui-menu-item--non-interactive': /*nonInteractive*/ ctx[6],
    							.../*internalClasses*/ ctx[16]
    						})
    					},
    					dirty[0] & /*internalStyles, style*/ 131088 && {
    						style: Object.entries(/*internalStyles*/ ctx[17]).map(func$2).concat([/*style*/ ctx[4]]).join(' ')
    					},
    					dirty[0] & /*nav, activated*/ 2097154 && get_spread_object(/*nav*/ ctx[21] && /*activated*/ ctx[1]
    					? { 'aria-current': 'page' }
    					: {}),
    					dirty[0] & /*nav, role*/ 2097408 && get_spread_object(!/*nav*/ ctx[21] ? { role: /*role*/ ctx[8] } : {}),
    					dirty[0] & /*nav, role, selected*/ 2097409 && get_spread_object(!/*nav*/ ctx[21] && /*role*/ ctx[8] === 'option'
    					? {
    							'aria-selected': /*selected*/ ctx[0] ? 'true' : 'false'
    						}
    					: {}),
    					dirty[0] & /*nav, role, input*/ 2113792 && get_spread_object(!/*nav*/ ctx[21] && (/*role*/ ctx[8] === 'radio' || /*role*/ ctx[8] === 'checkbox')
    					? {
    							'aria-checked': /*input*/ ctx[14] && /*input*/ ctx[14].checked
    							? 'true'
    							: 'false'
    						}
    					: {}),
    					dirty[0] & /*nav, disabled*/ 2097664 && get_spread_object(!/*nav*/ ctx[21]
    					? {
    							'aria-disabled': /*disabled*/ ctx[9] ? 'true' : 'false'
    						}
    					: {}),
    					dirty[0] & /*skipRestoreFocus*/ 1024 && {
    						"data-menu-item-skip-restore-focus": /*skipRestoreFocus*/ ctx[10] || undefined
    					},
    					dirty[0] & /*tabindex*/ 524288 && { tabindex: /*tabindex*/ ctx[19] },
    					dirty[0] & /*href*/ 2048 && { href: /*href*/ ctx[11] },
    					dirty[0] & /*internalAttrs*/ 262144 && get_spread_object(/*internalAttrs*/ ctx[18]),
    					dirty[0] & /*$$restProps*/ 134217728 && get_spread_object(/*$$restProps*/ ctx[27])
    				])
    			: {};

    			if (dirty[0] & /*ripple*/ 128 | dirty[1] & /*$$scope*/ 16) {
    				switch_instance_changes.$$scope = { dirty, ctx };
    			}

    			if (switch_value !== (switch_value = /*component*/ ctx[12])) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;

    					transition_out(old_component.$$.fragment, 1, 0, () => {
    						destroy_component(old_component, 1);
    					});

    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = new switch_value(switch_props(ctx));
    					/*switch_instance_binding*/ ctx[33](switch_instance);
    					switch_instance.$on("click", /*action*/ ctx[13]);
    					switch_instance.$on("keydown", /*handleKeydown*/ ctx[25]);
    					switch_instance.$on("SMUIGenericInput:mount", /*handleInputMount*/ ctx[26]);
    					switch_instance.$on("SMUIGenericInput:unmount", /*SMUIGenericInput_unmount_handler*/ ctx[34]);
    					create_component(switch_instance.$$.fragment);
    					transition_in(switch_instance.$$.fragment, 1);
    					mount_component(switch_instance, switch_instance_anchor.parentNode, switch_instance_anchor);
    				} else {
    					switch_instance = null;
    				}
    			} else if (switch_value) {
    				switch_instance.$set(switch_instance_changes);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			/*switch_instance_binding*/ ctx[33](null);
    			if (detaching) detach_dev(switch_instance_anchor);
    			if (switch_instance) destroy_component(switch_instance, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$8.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }
    let counter = 0;
    const func$2 = ([name, value]) => `${name}: ${value};`;

    function instance$6($$self, $$props, $$invalidate) {
    	let tabindex;

    	const omit_props_names = [
    		"use","class","style","color","nonInteractive","ripple","activated","role","selected","disabled","skipRestoreFocus","tabindex","inputId","href","component","action","getPrimaryText","getElement"
    	];

    	let $$restProps = compute_rest_props($$props, omit_props_names);
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Item', slots, ['default']);
    	var _a;
    	const forwardEvents = forwardEventsBuilder(get_current_component());

    	let uninitializedValue = () => {
    		
    	};

    	function isUninitializedValue(value) {
    		return value === uninitializedValue;
    	}

    	let { use = [] } = $$props;
    	let { class: className = '' } = $$props;
    	let { style = '' } = $$props;
    	let { color = undefined } = $$props;

    	let { nonInteractive = (_a = getContext('SMUI:list:nonInteractive')) !== null && _a !== void 0
    	? _a
    	: false } = $$props;

    	setContext('SMUI:list:nonInteractive', undefined);
    	let { ripple = !nonInteractive } = $$props;
    	let { activated = false } = $$props;
    	let { role = getContext('SMUI:list:item:role') } = $$props;
    	setContext('SMUI:list:item:role', undefined);
    	let { selected = false } = $$props;
    	let { disabled = false } = $$props;
    	let { skipRestoreFocus = false } = $$props;
    	let { tabindex: tabindexProp = uninitializedValue } = $$props;
    	let { inputId = 'SMUI-form-field-list-' + counter++ } = $$props;
    	let { href = undefined } = $$props;
    	let element;
    	let internalClasses = {};
    	let internalStyles = {};
    	let internalAttrs = {};
    	let input;
    	let addTabindexIfNoItemsSelectedRaf;
    	let nav = getContext('SMUI:list:item:nav');
    	let { component = nav ? href ? A : Span : Li } = $$props;
    	setContext('SMUI:generic:input:props', { id: inputId });

    	// Reset separator context, because we aren't directly under a list anymore.
    	setContext('SMUI:separator:context', undefined);

    	onMount(() => {
    		// Tabindex needs to be '0' if this is the first non-disabled list item, and
    		// no other item is selected.
    		if (!selected && !nonInteractive) {
    			let first = true;
    			let el = element;

    			while (el.previousSibling) {
    				el = el.previousSibling;

    				if (el.nodeType === 1 && el.classList.contains('mdc-deprecated-list-item') && !el.classList.contains('mdc-deprecated-list-item--disabled')) {
    					first = false;
    					break;
    				}
    			}

    			if (first) {
    				// This is first, so now set up a check that no other items are
    				// selected.
    				addTabindexIfNoItemsSelectedRaf = window.requestAnimationFrame(addTabindexIfNoItemsSelected);
    			}
    		}

    		const accessor = {
    			_smui_list_item_accessor: true,
    			get element() {
    				return getElement();
    			},
    			get selected() {
    				return selected;
    			},
    			set selected(value) {
    				$$invalidate(0, selected = value);
    			},
    			hasClass,
    			addClass,
    			removeClass,
    			getAttr,
    			addAttr,
    			removeAttr,
    			getPrimaryText,
    			// For inputs within item.
    			get checked() {
    				var _a;

    				return (_a = input && input.checked) !== null && _a !== void 0
    				? _a
    				: false;
    			},
    			set checked(value) {
    				if (input) {
    					$$invalidate(14, input.checked = !!value, input);
    				}
    			},
    			get hasCheckbox() {
    				return !!(input && '_smui_checkbox_accessor' in input);
    			},
    			get hasRadio() {
    				return !!(input && '_smui_radio_accessor' in input);
    			},
    			activateRipple() {
    				if (input) {
    					input.activateRipple();
    				}
    			},
    			deactivateRipple() {
    				if (input) {
    					input.deactivateRipple();
    				}
    			},
    			// For select options.
    			getValue() {
    				return $$restProps.value;
    			},
    			// For autocomplete
    			action,
    			get tabindex() {
    				return tabindex;
    			},
    			set tabindex(value) {
    				$$invalidate(28, tabindexProp = value);
    			},
    			get disabled() {
    				return disabled;
    			},
    			get activated() {
    				return activated;
    			},
    			set activated(value) {
    				$$invalidate(1, activated = value);
    			}
    		};

    		dispatch(getElement(), 'SMUIListItem:mount', accessor);

    		return () => {
    			dispatch(getElement(), 'SMUIListItem:unmount', accessor);
    		};
    	});

    	onDestroy(() => {
    		if (addTabindexIfNoItemsSelectedRaf) {
    			window.cancelAnimationFrame(addTabindexIfNoItemsSelectedRaf);
    		}
    	});

    	function hasClass(className) {
    		return className in internalClasses
    		? internalClasses[className]
    		: getElement().classList.contains(className);
    	}

    	function addClass(className) {
    		if (!internalClasses[className]) {
    			$$invalidate(16, internalClasses[className] = true, internalClasses);
    		}
    	}

    	function removeClass(className) {
    		if (!(className in internalClasses) || internalClasses[className]) {
    			$$invalidate(16, internalClasses[className] = false, internalClasses);
    		}
    	}

    	function addStyle(name, value) {
    		if (internalStyles[name] != value) {
    			if (value === '' || value == null) {
    				delete internalStyles[name];
    				$$invalidate(17, internalStyles);
    			} else {
    				$$invalidate(17, internalStyles[name] = value, internalStyles);
    			}
    		}
    	}

    	function getAttr(name) {
    		var _a;

    		return name in internalAttrs
    		? (_a = internalAttrs[name]) !== null && _a !== void 0
    			? _a
    			: null
    		: getElement().getAttribute(name);
    	}

    	function addAttr(name, value) {
    		if (internalAttrs[name] !== value) {
    			$$invalidate(18, internalAttrs[name] = value, internalAttrs);
    		}
    	}

    	function removeAttr(name) {
    		if (!(name in internalAttrs) || internalAttrs[name] != null) {
    			$$invalidate(18, internalAttrs[name] = undefined, internalAttrs);
    		}
    	}

    	function addTabindexIfNoItemsSelected() {
    		// Look through next siblings to see if none of them are selected.
    		let noneSelected = true;

    		let el = element.getElement();

    		while (el.nextElementSibling) {
    			el = el.nextElementSibling;

    			if (el.nodeType === 1 && el.classList.contains('mdc-deprecated-list-item')) {
    				const tabindexAttr = el.attributes.getNamedItem('tabindex');

    				if (tabindexAttr && tabindexAttr.value === '0') {
    					noneSelected = false;
    					break;
    				}
    			}
    		}

    		if (noneSelected) {
    			// This is the first element, and no other element is selected, so the
    			// tabindex should be '0'.
    			$$invalidate(19, tabindex = 0);
    		}
    	}

    	function handleKeydown(e) {
    		const isEnter = e.key === 'Enter';
    		const isSpace = e.key === 'Space';

    		if (isEnter || isSpace) {
    			action(e);
    		}
    	}

    	function handleInputMount(e) {
    		if ('_smui_checkbox_accessor' in e.detail || '_smui_radio_accessor' in e.detail) {
    			$$invalidate(14, input = e.detail);
    		}
    	}

    	function action(e) {
    		if (!disabled) {
    			dispatch(getElement(), 'SMUI:action', e);
    		}
    	}

    	function getPrimaryText() {
    		var _a, _b, _c;
    		const element = getElement();
    		const primaryText = element.querySelector('.mdc-deprecated-list-item__primary-text');

    		if (primaryText) {
    			return (_a = primaryText.textContent) !== null && _a !== void 0
    			? _a
    			: '';
    		}

    		const text = element.querySelector('.mdc-deprecated-list-item__text');

    		if (text) {
    			return (_b = text.textContent) !== null && _b !== void 0
    			? _b
    			: '';
    		}

    		return (_c = element.textContent) !== null && _c !== void 0
    		? _c
    		: '';
    	}

    	function getElement() {
    		return element.getElement();
    	}

    	function switch_instance_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			element = $$value;
    			$$invalidate(15, element);
    		});
    	}

    	const SMUIGenericInput_unmount_handler = () => $$invalidate(14, input = undefined);

    	$$self.$$set = $$new_props => {
    		$$props = assign(assign({}, $$props), exclude_internal_props($$new_props));
    		$$invalidate(27, $$restProps = compute_rest_props($$props, omit_props_names));
    		if ('use' in $$new_props) $$invalidate(2, use = $$new_props.use);
    		if ('class' in $$new_props) $$invalidate(3, className = $$new_props.class);
    		if ('style' in $$new_props) $$invalidate(4, style = $$new_props.style);
    		if ('color' in $$new_props) $$invalidate(5, color = $$new_props.color);
    		if ('nonInteractive' in $$new_props) $$invalidate(6, nonInteractive = $$new_props.nonInteractive);
    		if ('ripple' in $$new_props) $$invalidate(7, ripple = $$new_props.ripple);
    		if ('activated' in $$new_props) $$invalidate(1, activated = $$new_props.activated);
    		if ('role' in $$new_props) $$invalidate(8, role = $$new_props.role);
    		if ('selected' in $$new_props) $$invalidate(0, selected = $$new_props.selected);
    		if ('disabled' in $$new_props) $$invalidate(9, disabled = $$new_props.disabled);
    		if ('skipRestoreFocus' in $$new_props) $$invalidate(10, skipRestoreFocus = $$new_props.skipRestoreFocus);
    		if ('tabindex' in $$new_props) $$invalidate(28, tabindexProp = $$new_props.tabindex);
    		if ('inputId' in $$new_props) $$invalidate(29, inputId = $$new_props.inputId);
    		if ('href' in $$new_props) $$invalidate(11, href = $$new_props.href);
    		if ('component' in $$new_props) $$invalidate(12, component = $$new_props.component);
    		if ('$$scope' in $$new_props) $$invalidate(35, $$scope = $$new_props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		counter,
    		_a,
    		onMount,
    		onDestroy,
    		getContext,
    		setContext,
    		get_current_component,
    		forwardEventsBuilder,
    		classMap,
    		dispatch,
    		Ripple,
    		A,
    		Span,
    		Li,
    		forwardEvents,
    		uninitializedValue,
    		isUninitializedValue,
    		use,
    		className,
    		style,
    		color,
    		nonInteractive,
    		ripple,
    		activated,
    		role,
    		selected,
    		disabled,
    		skipRestoreFocus,
    		tabindexProp,
    		inputId,
    		href,
    		element,
    		internalClasses,
    		internalStyles,
    		internalAttrs,
    		input,
    		addTabindexIfNoItemsSelectedRaf,
    		nav,
    		component,
    		hasClass,
    		addClass,
    		removeClass,
    		addStyle,
    		getAttr,
    		addAttr,
    		removeAttr,
    		addTabindexIfNoItemsSelected,
    		handleKeydown,
    		handleInputMount,
    		action,
    		getPrimaryText,
    		getElement,
    		tabindex
    	});

    	$$self.$inject_state = $$new_props => {
    		if ('_a' in $$props) _a = $$new_props._a;
    		if ('uninitializedValue' in $$props) uninitializedValue = $$new_props.uninitializedValue;
    		if ('use' in $$props) $$invalidate(2, use = $$new_props.use);
    		if ('className' in $$props) $$invalidate(3, className = $$new_props.className);
    		if ('style' in $$props) $$invalidate(4, style = $$new_props.style);
    		if ('color' in $$props) $$invalidate(5, color = $$new_props.color);
    		if ('nonInteractive' in $$props) $$invalidate(6, nonInteractive = $$new_props.nonInteractive);
    		if ('ripple' in $$props) $$invalidate(7, ripple = $$new_props.ripple);
    		if ('activated' in $$props) $$invalidate(1, activated = $$new_props.activated);
    		if ('role' in $$props) $$invalidate(8, role = $$new_props.role);
    		if ('selected' in $$props) $$invalidate(0, selected = $$new_props.selected);
    		if ('disabled' in $$props) $$invalidate(9, disabled = $$new_props.disabled);
    		if ('skipRestoreFocus' in $$props) $$invalidate(10, skipRestoreFocus = $$new_props.skipRestoreFocus);
    		if ('tabindexProp' in $$props) $$invalidate(28, tabindexProp = $$new_props.tabindexProp);
    		if ('inputId' in $$props) $$invalidate(29, inputId = $$new_props.inputId);
    		if ('href' in $$props) $$invalidate(11, href = $$new_props.href);
    		if ('element' in $$props) $$invalidate(15, element = $$new_props.element);
    		if ('internalClasses' in $$props) $$invalidate(16, internalClasses = $$new_props.internalClasses);
    		if ('internalStyles' in $$props) $$invalidate(17, internalStyles = $$new_props.internalStyles);
    		if ('internalAttrs' in $$props) $$invalidate(18, internalAttrs = $$new_props.internalAttrs);
    		if ('input' in $$props) $$invalidate(14, input = $$new_props.input);
    		if ('addTabindexIfNoItemsSelectedRaf' in $$props) addTabindexIfNoItemsSelectedRaf = $$new_props.addTabindexIfNoItemsSelectedRaf;
    		if ('nav' in $$props) $$invalidate(21, nav = $$new_props.nav);
    		if ('component' in $$props) $$invalidate(12, component = $$new_props.component);
    		if ('tabindex' in $$props) $$invalidate(19, tabindex = $$new_props.tabindex);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty[0] & /*tabindexProp, nonInteractive, disabled, selected, input*/ 268452417) {
    			$$invalidate(19, tabindex = isUninitializedValue(tabindexProp)
    			? !nonInteractive && !disabled && (selected || input && input.checked)
    				? 0
    				: -1
    			: tabindexProp);
    		}
    	};

    	return [
    		selected,
    		activated,
    		use,
    		className,
    		style,
    		color,
    		nonInteractive,
    		ripple,
    		role,
    		disabled,
    		skipRestoreFocus,
    		href,
    		component,
    		action,
    		input,
    		element,
    		internalClasses,
    		internalStyles,
    		internalAttrs,
    		tabindex,
    		forwardEvents,
    		nav,
    		addClass,
    		removeClass,
    		addStyle,
    		handleKeydown,
    		handleInputMount,
    		$$restProps,
    		tabindexProp,
    		inputId,
    		getPrimaryText,
    		getElement,
    		slots,
    		switch_instance_binding,
    		SMUIGenericInput_unmount_handler,
    		$$scope
    	];
    }

    class Item$1 extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(
    			this,
    			options,
    			instance$6,
    			create_fragment$8,
    			safe_not_equal,
    			{
    				use: 2,
    				class: 3,
    				style: 4,
    				color: 5,
    				nonInteractive: 6,
    				ripple: 7,
    				activated: 1,
    				role: 8,
    				selected: 0,
    				disabled: 9,
    				skipRestoreFocus: 10,
    				tabindex: 28,
    				inputId: 29,
    				href: 11,
    				component: 12,
    				action: 13,
    				getPrimaryText: 30,
    				getElement: 31
    			},
    			null,
    			[-1, -1]
    		);

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Item",
    			options,
    			id: create_fragment$8.name
    		});
    	}

    	get use() {
    		throw new Error("<Item>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set use(value) {
    		throw new Error("<Item>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get class() {
    		throw new Error("<Item>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set class(value) {
    		throw new Error("<Item>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get style() {
    		throw new Error("<Item>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set style(value) {
    		throw new Error("<Item>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get color() {
    		throw new Error("<Item>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set color(value) {
    		throw new Error("<Item>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get nonInteractive() {
    		throw new Error("<Item>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set nonInteractive(value) {
    		throw new Error("<Item>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get ripple() {
    		throw new Error("<Item>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set ripple(value) {
    		throw new Error("<Item>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get activated() {
    		throw new Error("<Item>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set activated(value) {
    		throw new Error("<Item>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get role() {
    		throw new Error("<Item>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set role(value) {
    		throw new Error("<Item>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get selected() {
    		throw new Error("<Item>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set selected(value) {
    		throw new Error("<Item>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get disabled() {
    		throw new Error("<Item>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set disabled(value) {
    		throw new Error("<Item>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get skipRestoreFocus() {
    		throw new Error("<Item>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set skipRestoreFocus(value) {
    		throw new Error("<Item>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get tabindex() {
    		throw new Error("<Item>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set tabindex(value) {
    		throw new Error("<Item>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get inputId() {
    		throw new Error("<Item>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set inputId(value) {
    		throw new Error("<Item>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get href() {
    		throw new Error("<Item>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set href(value) {
    		throw new Error("<Item>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get component() {
    		throw new Error("<Item>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set component(value) {
    		throw new Error("<Item>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get action() {
    		return this.$$.ctx[13];
    	}

    	set action(value) {
    		throw new Error("<Item>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get getPrimaryText() {
    		return this.$$.ctx[30];
    	}

    	set getPrimaryText(value) {
    		throw new Error("<Item>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get getElement() {
    		return this.$$.ctx[31];
    	}

    	set getElement(value) {
    		throw new Error("<Item>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    var Text = classAdderBuilder({
        class: 'mdc-deprecated-list-item__text',
        component: Span,
    });

    classAdderBuilder({
        class: 'mdc-deprecated-list-item__primary-text',
        component: Span,
    });

    classAdderBuilder({
        class: 'mdc-deprecated-list-item__secondary-text',
        component: Span,
    });

    /* node_modules\@smui\list\dist\Graphic.svelte generated by Svelte v3.46.4 */
    const file$7 = "node_modules\\@smui\\list\\dist\\Graphic.svelte";

    function create_fragment$7(ctx) {
    	let span;
    	let span_class_value;
    	let useActions_action;
    	let current;
    	let mounted;
    	let dispose;
    	const default_slot_template = /*#slots*/ ctx[8].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[7], null);

    	let span_levels = [
    		{
    			class: span_class_value = classMap({
    				[/*className*/ ctx[1]]: true,
    				'mdc-deprecated-list-item__graphic': true,
    				'mdc-menu__selection-group-icon': /*menuSelectionGroup*/ ctx[4]
    			})
    		},
    		/*$$restProps*/ ctx[5]
    	];

    	let span_data = {};

    	for (let i = 0; i < span_levels.length; i += 1) {
    		span_data = assign(span_data, span_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			span = element("span");
    			if (default_slot) default_slot.c();
    			set_attributes(span, span_data);
    			add_location(span, file$7, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);

    			if (default_slot) {
    				default_slot.m(span, null);
    			}

    			/*span_binding*/ ctx[9](span);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					action_destroyer(useActions_action = useActions.call(null, span, /*use*/ ctx[0])),
    					action_destroyer(/*forwardEvents*/ ctx[3].call(null, span))
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 128)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[7],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[7])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[7], dirty, null),
    						null
    					);
    				}
    			}

    			set_attributes(span, span_data = get_spread_update(span_levels, [
    				(!current || dirty & /*className*/ 2 && span_class_value !== (span_class_value = classMap({
    					[/*className*/ ctx[1]]: true,
    					'mdc-deprecated-list-item__graphic': true,
    					'mdc-menu__selection-group-icon': /*menuSelectionGroup*/ ctx[4]
    				}))) && { class: span_class_value },
    				dirty & /*$$restProps*/ 32 && /*$$restProps*/ ctx[5]
    			]));

    			if (useActions_action && is_function(useActions_action.update) && dirty & /*use*/ 1) useActions_action.update.call(null, /*use*/ ctx[0]);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    			if (default_slot) default_slot.d(detaching);
    			/*span_binding*/ ctx[9](null);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$7.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$5($$self, $$props, $$invalidate) {
    	const omit_props_names = ["use","class","getElement"];
    	let $$restProps = compute_rest_props($$props, omit_props_names);
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Graphic', slots, ['default']);
    	const forwardEvents = forwardEventsBuilder(get_current_component());
    	let { use = [] } = $$props;
    	let { class: className = '' } = $$props;
    	let element;
    	let menuSelectionGroup = getContext('SMUI:list:graphic:menu-selection-group');

    	function getElement() {
    		return element;
    	}

    	function span_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			element = $$value;
    			$$invalidate(2, element);
    		});
    	}

    	$$self.$$set = $$new_props => {
    		$$props = assign(assign({}, $$props), exclude_internal_props($$new_props));
    		$$invalidate(5, $$restProps = compute_rest_props($$props, omit_props_names));
    		if ('use' in $$new_props) $$invalidate(0, use = $$new_props.use);
    		if ('class' in $$new_props) $$invalidate(1, className = $$new_props.class);
    		if ('$$scope' in $$new_props) $$invalidate(7, $$scope = $$new_props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		getContext,
    		get_current_component,
    		forwardEventsBuilder,
    		classMap,
    		useActions,
    		forwardEvents,
    		use,
    		className,
    		element,
    		menuSelectionGroup,
    		getElement
    	});

    	$$self.$inject_state = $$new_props => {
    		if ('use' in $$props) $$invalidate(0, use = $$new_props.use);
    		if ('className' in $$props) $$invalidate(1, className = $$new_props.className);
    		if ('element' in $$props) $$invalidate(2, element = $$new_props.element);
    		if ('menuSelectionGroup' in $$props) $$invalidate(4, menuSelectionGroup = $$new_props.menuSelectionGroup);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		use,
    		className,
    		element,
    		forwardEvents,
    		menuSelectionGroup,
    		$$restProps,
    		getElement,
    		$$scope,
    		slots,
    		span_binding
    	];
    }

    class Graphic$1 extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$7, safe_not_equal, { use: 0, class: 1, getElement: 6 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Graphic",
    			options,
    			id: create_fragment$7.name
    		});
    	}

    	get use() {
    		throw new Error("<Graphic>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set use(value) {
    		throw new Error("<Graphic>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get class() {
    		throw new Error("<Graphic>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set class(value) {
    		throw new Error("<Graphic>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get getElement() {
    		return this.$$.ctx[6];
    	}

    	set getElement(value) {
    		throw new Error("<Graphic>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    classAdderBuilder({
        class: 'mdc-deprecated-list-item__meta',
        component: Span,
    });

    classAdderBuilder({
        class: 'mdc-deprecated-list-group',
        component: Div,
    });

    classAdderBuilder({
        class: 'mdc-deprecated-list-group__subheader',
        component: H3,
    });

    const Item = Item$1;
    const Graphic = Graphic$1;

    classAdderBuilder({
        class: 'mdc-menu__selection-group-icon',
        component: Graphic,
    });

    function cubicOut(t) {
        const f = t - 1.0;
        return f * f * f + 1.0;
    }

    function fade(node, { delay = 0, duration = 400, easing = identity } = {}) {
        const o = +getComputedStyle(node).opacity;
        return {
            delay,
            duration,
            easing,
            css: t => `opacity: ${t * o}`
        };
    }
    function fly(node, { delay = 0, duration = 400, easing = cubicOut, x = 0, y = 0, opacity = 0 } = {}) {
        const style = getComputedStyle(node);
        const target_opacity = +style.opacity;
        const transform = style.transform === 'none' ? '' : style.transform;
        const od = target_opacity * (1 - opacity);
        return {
            delay,
            duration,
            easing,
            css: (t, u) => `
			transform: ${transform} translate(${(1 - t) * x}px, ${(1 - t) * y}px);
			opacity: ${target_opacity - (od * u)}`
        };
    }

    /* node_modules\@smui\card\dist\Card.svelte generated by Svelte v3.46.4 */
    const file$6 = "node_modules\\@smui\\card\\dist\\Card.svelte";

    function create_fragment$6(ctx) {
    	let div;
    	let div_class_value;
    	let useActions_action;
    	let current;
    	let mounted;
    	let dispose;
    	const default_slot_template = /*#slots*/ ctx[9].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[8], null);

    	let div_levels = [
    		{
    			class: div_class_value = classMap({
    				[/*className*/ ctx[1]]: true,
    				'mdc-card': true,
    				'mdc-card--outlined': /*variant*/ ctx[2] === 'outlined',
    				'smui-card--padded': /*padded*/ ctx[3]
    			})
    		},
    		/*$$restProps*/ ctx[6]
    	];

    	let div_data = {};

    	for (let i = 0; i < div_levels.length; i += 1) {
    		div_data = assign(div_data, div_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (default_slot) default_slot.c();
    			set_attributes(div, div_data);
    			add_location(div, file$6, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (default_slot) {
    				default_slot.m(div, null);
    			}

    			/*div_binding*/ ctx[10](div);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					action_destroyer(useActions_action = useActions.call(null, div, /*use*/ ctx[0])),
    					action_destroyer(/*forwardEvents*/ ctx[5].call(null, div))
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 256)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[8],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[8])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[8], dirty, null),
    						null
    					);
    				}
    			}

    			set_attributes(div, div_data = get_spread_update(div_levels, [
    				(!current || dirty & /*className, variant, padded*/ 14 && div_class_value !== (div_class_value = classMap({
    					[/*className*/ ctx[1]]: true,
    					'mdc-card': true,
    					'mdc-card--outlined': /*variant*/ ctx[2] === 'outlined',
    					'smui-card--padded': /*padded*/ ctx[3]
    				}))) && { class: div_class_value },
    				dirty & /*$$restProps*/ 64 && /*$$restProps*/ ctx[6]
    			]));

    			if (useActions_action && is_function(useActions_action.update) && dirty & /*use*/ 1) useActions_action.update.call(null, /*use*/ ctx[0]);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (default_slot) default_slot.d(detaching);
    			/*div_binding*/ ctx[10](null);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$6.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$4($$self, $$props, $$invalidate) {
    	const omit_props_names = ["use","class","variant","padded","getElement"];
    	let $$restProps = compute_rest_props($$props, omit_props_names);
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Card', slots, ['default']);
    	const forwardEvents = forwardEventsBuilder(get_current_component());
    	let { use = [] } = $$props;
    	let { class: className = '' } = $$props;
    	let { variant = 'raised' } = $$props;
    	let { padded = false } = $$props;
    	let element;

    	function getElement() {
    		return element;
    	}

    	function div_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			element = $$value;
    			$$invalidate(4, element);
    		});
    	}

    	$$self.$$set = $$new_props => {
    		$$props = assign(assign({}, $$props), exclude_internal_props($$new_props));
    		$$invalidate(6, $$restProps = compute_rest_props($$props, omit_props_names));
    		if ('use' in $$new_props) $$invalidate(0, use = $$new_props.use);
    		if ('class' in $$new_props) $$invalidate(1, className = $$new_props.class);
    		if ('variant' in $$new_props) $$invalidate(2, variant = $$new_props.variant);
    		if ('padded' in $$new_props) $$invalidate(3, padded = $$new_props.padded);
    		if ('$$scope' in $$new_props) $$invalidate(8, $$scope = $$new_props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		get_current_component,
    		forwardEventsBuilder,
    		classMap,
    		useActions,
    		forwardEvents,
    		use,
    		className,
    		variant,
    		padded,
    		element,
    		getElement
    	});

    	$$self.$inject_state = $$new_props => {
    		if ('use' in $$props) $$invalidate(0, use = $$new_props.use);
    		if ('className' in $$props) $$invalidate(1, className = $$new_props.className);
    		if ('variant' in $$props) $$invalidate(2, variant = $$new_props.variant);
    		if ('padded' in $$props) $$invalidate(3, padded = $$new_props.padded);
    		if ('element' in $$props) $$invalidate(4, element = $$new_props.element);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		use,
    		className,
    		variant,
    		padded,
    		element,
    		forwardEvents,
    		$$restProps,
    		getElement,
    		$$scope,
    		slots,
    		div_binding
    	];
    }

    class Card extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$4, create_fragment$6, safe_not_equal, {
    			use: 0,
    			class: 1,
    			variant: 2,
    			padded: 3,
    			getElement: 7
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Card",
    			options,
    			id: create_fragment$6.name
    		});
    	}

    	get use() {
    		throw new Error("<Card>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set use(value) {
    		throw new Error("<Card>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get class() {
    		throw new Error("<Card>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set class(value) {
    		throw new Error("<Card>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get variant() {
    		throw new Error("<Card>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set variant(value) {
    		throw new Error("<Card>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get padded() {
    		throw new Error("<Card>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set padded(value) {
    		throw new Error("<Card>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get getElement() {
    		return this.$$.ctx[7];
    	}

    	set getElement(value) {
    		throw new Error("<Card>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    var Content = classAdderBuilder({
        class: 'smui-card__content',
        component: Div,
    });

    classAdderBuilder({
        class: 'mdc-card__media-content',
        component: Div,
    });

    /* node_modules\@smui\card\dist\Actions.svelte generated by Svelte v3.46.4 */
    const file$5 = "node_modules\\@smui\\card\\dist\\Actions.svelte";

    function create_fragment$5(ctx) {
    	let div;
    	let div_class_value;
    	let useActions_action;
    	let current;
    	let mounted;
    	let dispose;
    	const default_slot_template = /*#slots*/ ctx[8].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[7], null);

    	let div_levels = [
    		{
    			class: div_class_value = classMap({
    				[/*className*/ ctx[1]]: true,
    				'mdc-card__actions': true,
    				'mdc-card__actions--full-bleed': /*fullBleed*/ ctx[2]
    			})
    		},
    		/*$$restProps*/ ctx[5]
    	];

    	let div_data = {};

    	for (let i = 0; i < div_levels.length; i += 1) {
    		div_data = assign(div_data, div_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (default_slot) default_slot.c();
    			set_attributes(div, div_data);
    			add_location(div, file$5, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (default_slot) {
    				default_slot.m(div, null);
    			}

    			/*div_binding*/ ctx[9](div);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					action_destroyer(useActions_action = useActions.call(null, div, /*use*/ ctx[0])),
    					action_destroyer(/*forwardEvents*/ ctx[4].call(null, div))
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 128)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[7],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[7])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[7], dirty, null),
    						null
    					);
    				}
    			}

    			set_attributes(div, div_data = get_spread_update(div_levels, [
    				(!current || dirty & /*className, fullBleed*/ 6 && div_class_value !== (div_class_value = classMap({
    					[/*className*/ ctx[1]]: true,
    					'mdc-card__actions': true,
    					'mdc-card__actions--full-bleed': /*fullBleed*/ ctx[2]
    				}))) && { class: div_class_value },
    				dirty & /*$$restProps*/ 32 && /*$$restProps*/ ctx[5]
    			]));

    			if (useActions_action && is_function(useActions_action.update) && dirty & /*use*/ 1) useActions_action.update.call(null, /*use*/ ctx[0]);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (default_slot) default_slot.d(detaching);
    			/*div_binding*/ ctx[9](null);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props, $$invalidate) {
    	const omit_props_names = ["use","class","fullBleed","getElement"];
    	let $$restProps = compute_rest_props($$props, omit_props_names);
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Actions', slots, ['default']);
    	const forwardEvents = forwardEventsBuilder(get_current_component());
    	let { use = [] } = $$props;
    	let { class: className = '' } = $$props;
    	let { fullBleed = false } = $$props;
    	let element;
    	setContext('SMUI:button:context', 'card:action');
    	setContext('SMUI:icon-button:context', 'card:action');

    	function getElement() {
    		return element;
    	}

    	function div_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			element = $$value;
    			$$invalidate(3, element);
    		});
    	}

    	$$self.$$set = $$new_props => {
    		$$props = assign(assign({}, $$props), exclude_internal_props($$new_props));
    		$$invalidate(5, $$restProps = compute_rest_props($$props, omit_props_names));
    		if ('use' in $$new_props) $$invalidate(0, use = $$new_props.use);
    		if ('class' in $$new_props) $$invalidate(1, className = $$new_props.class);
    		if ('fullBleed' in $$new_props) $$invalidate(2, fullBleed = $$new_props.fullBleed);
    		if ('$$scope' in $$new_props) $$invalidate(7, $$scope = $$new_props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		setContext,
    		get_current_component,
    		forwardEventsBuilder,
    		classMap,
    		useActions,
    		forwardEvents,
    		use,
    		className,
    		fullBleed,
    		element,
    		getElement
    	});

    	$$self.$inject_state = $$new_props => {
    		if ('use' in $$props) $$invalidate(0, use = $$new_props.use);
    		if ('className' in $$props) $$invalidate(1, className = $$new_props.className);
    		if ('fullBleed' in $$props) $$invalidate(2, fullBleed = $$new_props.fullBleed);
    		if ('element' in $$props) $$invalidate(3, element = $$new_props.element);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		use,
    		className,
    		fullBleed,
    		element,
    		forwardEvents,
    		$$restProps,
    		getElement,
    		$$scope,
    		slots,
    		div_binding
    	];
    }

    class Actions$1 extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$3, create_fragment$5, safe_not_equal, {
    			use: 0,
    			class: 1,
    			fullBleed: 2,
    			getElement: 6
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Actions",
    			options,
    			id: create_fragment$5.name
    		});
    	}

    	get use() {
    		throw new Error("<Actions>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set use(value) {
    		throw new Error("<Actions>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get class() {
    		throw new Error("<Actions>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set class(value) {
    		throw new Error("<Actions>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get fullBleed() {
    		throw new Error("<Actions>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set fullBleed(value) {
    		throw new Error("<Actions>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get getElement() {
    		return this.$$.ctx[6];
    	}

    	set getElement(value) {
    		throw new Error("<Actions>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    classAdderBuilder({
        class: 'mdc-card__action-buttons',
        component: Div,
    });

    classAdderBuilder({
        class: 'mdc-card__action-icons',
        component: Div,
    });

    const Actions = Actions$1;

    /* node_modules\@smui\button\dist\Button.svelte generated by Svelte v3.46.4 */
    const file$4 = "node_modules\\@smui\\button\\dist\\Button.svelte";

    // (50:10) {#if touch}
    function create_if_block$3(ctx) {
    	let div;

    	const block = {
    		c: function create() {
    			div = element("div");
    			attr_dev(div, "class", "mdc-button__touch");
    			add_location(div, file$4, 49, 21, 1522);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$3.name,
    		type: "if",
    		source: "(50:10) {#if touch}",
    		ctx
    	});

    	return block;
    }

    // (1:0) <svelte:component   this={component}   bind:this={element}   use={[     [       Ripple,       {         ripple,         unbounded: false,         color,         disabled: !!$$restProps.disabled,         addClass,         removeClass,         addStyle,       },     ],     forwardEvents,     ...use,   ]}   class={classMap({     [className]: true,     'mdc-button': true,     'mdc-button--raised': variant === 'raised',     'mdc-button--unelevated': variant === 'unelevated',     'mdc-button--outlined': variant === 'outlined',     'smui-button--color-secondary': color === 'secondary',     'mdc-button--touch': touch,     'mdc-card__action': context === 'card:action',     'mdc-card__action--button': context === 'card:action',     'mdc-dialog__button': context === 'dialog:action',     'mdc-top-app-bar__navigation-icon': context === 'top-app-bar:navigation',     'mdc-top-app-bar__action-item': context === 'top-app-bar:action',     'mdc-snackbar__action': context === 'snackbar:actions',     'mdc-banner__secondary-action': context === 'banner' && secondary,     'mdc-banner__primary-action': context === 'banner' && !secondary,     'mdc-tooltip__action': context === 'tooltip:rich-actions',     ...internalClasses,   })}   style={Object.entries(internalStyles)     .map(([name, value]) => `${name}: ${value};`)     .concat([style])     .join(' ')}   {...actionProp}   {...defaultProp}   {...secondaryProp}   {href}   on:click={handleClick}   {...$$restProps}   >
    function create_default_slot$3(ctx) {
    	let div;
    	let t;
    	let if_block_anchor;
    	let current;
    	const default_slot_template = /*#slots*/ ctx[27].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[29], null);
    	let if_block = /*touch*/ ctx[6] && create_if_block$3(ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			t = space();
    			if (default_slot) default_slot.c();
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    			attr_dev(div, "class", "mdc-button__ripple");
    			add_location(div, file$4, 48, 3, 1466);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			insert_dev(target, t, anchor);

    			if (default_slot) {
    				default_slot.m(target, anchor);
    			}

    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 536870912)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[29],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[29])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[29], dirty, null),
    						null
    					);
    				}
    			}

    			if (/*touch*/ ctx[6]) {
    				if (if_block) ; else {
    					if_block = create_if_block$3(ctx);
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (detaching) detach_dev(t);
    			if (default_slot) default_slot.d(detaching);
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$3.name,
    		type: "slot",
    		source: "(1:0) <svelte:component   this={component}   bind:this={element}   use={[     [       Ripple,       {         ripple,         unbounded: false,         color,         disabled: !!$$restProps.disabled,         addClass,         removeClass,         addStyle,       },     ],     forwardEvents,     ...use,   ]}   class={classMap({     [className]: true,     'mdc-button': true,     'mdc-button--raised': variant === 'raised',     'mdc-button--unelevated': variant === 'unelevated',     'mdc-button--outlined': variant === 'outlined',     'smui-button--color-secondary': color === 'secondary',     'mdc-button--touch': touch,     'mdc-card__action': context === 'card:action',     'mdc-card__action--button': context === 'card:action',     'mdc-dialog__button': context === 'dialog:action',     'mdc-top-app-bar__navigation-icon': context === 'top-app-bar:navigation',     'mdc-top-app-bar__action-item': context === 'top-app-bar:action',     'mdc-snackbar__action': context === 'snackbar:actions',     'mdc-banner__secondary-action': context === 'banner' && secondary,     'mdc-banner__primary-action': context === 'banner' && !secondary,     'mdc-tooltip__action': context === 'tooltip:rich-actions',     ...internalClasses,   })}   style={Object.entries(internalStyles)     .map(([name, value]) => `${name}: ${value};`)     .concat([style])     .join(' ')}   {...actionProp}   {...defaultProp}   {...secondaryProp}   {href}   on:click={handleClick}   {...$$restProps}   >",
    		ctx
    	});

    	return block;
    }

    function create_fragment$4(ctx) {
    	let switch_instance;
    	let switch_instance_anchor;
    	let current;

    	const switch_instance_spread_levels = [
    		{
    			use: [
    				[
    					Ripple,
    					{
    						ripple: /*ripple*/ ctx[3],
    						unbounded: false,
    						color: /*color*/ ctx[4],
    						disabled: !!/*$$restProps*/ ctx[22].disabled,
    						addClass: /*addClass*/ ctx[18],
    						removeClass: /*removeClass*/ ctx[19],
    						addStyle: /*addStyle*/ ctx[20]
    					}
    				],
    				/*forwardEvents*/ ctx[16],
    				.../*use*/ ctx[0]
    			]
    		},
    		{
    			class: classMap({
    				[/*className*/ ctx[1]]: true,
    				'mdc-button': true,
    				'mdc-button--raised': /*variant*/ ctx[5] === 'raised',
    				'mdc-button--unelevated': /*variant*/ ctx[5] === 'unelevated',
    				'mdc-button--outlined': /*variant*/ ctx[5] === 'outlined',
    				'smui-button--color-secondary': /*color*/ ctx[4] === 'secondary',
    				'mdc-button--touch': /*touch*/ ctx[6],
    				'mdc-card__action': /*context*/ ctx[17] === 'card:action',
    				'mdc-card__action--button': /*context*/ ctx[17] === 'card:action',
    				'mdc-dialog__button': /*context*/ ctx[17] === 'dialog:action',
    				'mdc-top-app-bar__navigation-icon': /*context*/ ctx[17] === 'top-app-bar:navigation',
    				'mdc-top-app-bar__action-item': /*context*/ ctx[17] === 'top-app-bar:action',
    				'mdc-snackbar__action': /*context*/ ctx[17] === 'snackbar:actions',
    				'mdc-banner__secondary-action': /*context*/ ctx[17] === 'banner' && /*secondary*/ ctx[8],
    				'mdc-banner__primary-action': /*context*/ ctx[17] === 'banner' && !/*secondary*/ ctx[8],
    				'mdc-tooltip__action': /*context*/ ctx[17] === 'tooltip:rich-actions',
    				.../*internalClasses*/ ctx[11]
    			})
    		},
    		{
    			style: Object.entries(/*internalStyles*/ ctx[12]).map(func$1).concat([/*style*/ ctx[2]]).join(' ')
    		},
    		/*actionProp*/ ctx[15],
    		/*defaultProp*/ ctx[14],
    		/*secondaryProp*/ ctx[13],
    		{ href: /*href*/ ctx[7] },
    		/*$$restProps*/ ctx[22]
    	];

    	var switch_value = /*component*/ ctx[9];

    	function switch_props(ctx) {
    		let switch_instance_props = {
    			$$slots: { default: [create_default_slot$3] },
    			$$scope: { ctx }
    		};

    		for (let i = 0; i < switch_instance_spread_levels.length; i += 1) {
    			switch_instance_props = assign(switch_instance_props, switch_instance_spread_levels[i]);
    		}

    		return {
    			props: switch_instance_props,
    			$$inline: true
    		};
    	}

    	if (switch_value) {
    		switch_instance = new switch_value(switch_props(ctx));
    		/*switch_instance_binding*/ ctx[28](switch_instance);
    		switch_instance.$on("click", /*handleClick*/ ctx[21]);
    	}

    	const block = {
    		c: function create() {
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			switch_instance_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (switch_instance) {
    				mount_component(switch_instance, target, anchor);
    			}

    			insert_dev(target, switch_instance_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const switch_instance_changes = (dirty & /*Ripple, ripple, color, $$restProps, addClass, removeClass, addStyle, forwardEvents, use, classMap, className, variant, touch, context, secondary, internalClasses, Object, internalStyles, style, actionProp, defaultProp, secondaryProp, href*/ 6289919)
    			? get_spread_update(switch_instance_spread_levels, [
    					dirty & /*Ripple, ripple, color, $$restProps, addClass, removeClass, addStyle, forwardEvents, use*/ 6094873 && {
    						use: [
    							[
    								Ripple,
    								{
    									ripple: /*ripple*/ ctx[3],
    									unbounded: false,
    									color: /*color*/ ctx[4],
    									disabled: !!/*$$restProps*/ ctx[22].disabled,
    									addClass: /*addClass*/ ctx[18],
    									removeClass: /*removeClass*/ ctx[19],
    									addStyle: /*addStyle*/ ctx[20]
    								}
    							],
    							/*forwardEvents*/ ctx[16],
    							.../*use*/ ctx[0]
    						]
    					},
    					dirty & /*classMap, className, variant, color, touch, context, secondary, internalClasses*/ 133490 && {
    						class: classMap({
    							[/*className*/ ctx[1]]: true,
    							'mdc-button': true,
    							'mdc-button--raised': /*variant*/ ctx[5] === 'raised',
    							'mdc-button--unelevated': /*variant*/ ctx[5] === 'unelevated',
    							'mdc-button--outlined': /*variant*/ ctx[5] === 'outlined',
    							'smui-button--color-secondary': /*color*/ ctx[4] === 'secondary',
    							'mdc-button--touch': /*touch*/ ctx[6],
    							'mdc-card__action': /*context*/ ctx[17] === 'card:action',
    							'mdc-card__action--button': /*context*/ ctx[17] === 'card:action',
    							'mdc-dialog__button': /*context*/ ctx[17] === 'dialog:action',
    							'mdc-top-app-bar__navigation-icon': /*context*/ ctx[17] === 'top-app-bar:navigation',
    							'mdc-top-app-bar__action-item': /*context*/ ctx[17] === 'top-app-bar:action',
    							'mdc-snackbar__action': /*context*/ ctx[17] === 'snackbar:actions',
    							'mdc-banner__secondary-action': /*context*/ ctx[17] === 'banner' && /*secondary*/ ctx[8],
    							'mdc-banner__primary-action': /*context*/ ctx[17] === 'banner' && !/*secondary*/ ctx[8],
    							'mdc-tooltip__action': /*context*/ ctx[17] === 'tooltip:rich-actions',
    							.../*internalClasses*/ ctx[11]
    						})
    					},
    					dirty & /*Object, internalStyles, style*/ 4100 && {
    						style: Object.entries(/*internalStyles*/ ctx[12]).map(func$1).concat([/*style*/ ctx[2]]).join(' ')
    					},
    					dirty & /*actionProp*/ 32768 && get_spread_object(/*actionProp*/ ctx[15]),
    					dirty & /*defaultProp*/ 16384 && get_spread_object(/*defaultProp*/ ctx[14]),
    					dirty & /*secondaryProp*/ 8192 && get_spread_object(/*secondaryProp*/ ctx[13]),
    					dirty & /*href*/ 128 && { href: /*href*/ ctx[7] },
    					dirty & /*$$restProps*/ 4194304 && get_spread_object(/*$$restProps*/ ctx[22])
    				])
    			: {};

    			if (dirty & /*$$scope, touch*/ 536870976) {
    				switch_instance_changes.$$scope = { dirty, ctx };
    			}

    			if (switch_value !== (switch_value = /*component*/ ctx[9])) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;

    					transition_out(old_component.$$.fragment, 1, 0, () => {
    						destroy_component(old_component, 1);
    					});

    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = new switch_value(switch_props(ctx));
    					/*switch_instance_binding*/ ctx[28](switch_instance);
    					switch_instance.$on("click", /*handleClick*/ ctx[21]);
    					create_component(switch_instance.$$.fragment);
    					transition_in(switch_instance.$$.fragment, 1);
    					mount_component(switch_instance, switch_instance_anchor.parentNode, switch_instance_anchor);
    				} else {
    					switch_instance = null;
    				}
    			} else if (switch_value) {
    				switch_instance.$set(switch_instance_changes);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			/*switch_instance_binding*/ ctx[28](null);
    			if (detaching) detach_dev(switch_instance_anchor);
    			if (switch_instance) destroy_component(switch_instance, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    const func$1 = ([name, value]) => `${name}: ${value};`;

    function instance$2($$self, $$props, $$invalidate) {
    	let actionProp;
    	let defaultProp;
    	let secondaryProp;

    	const omit_props_names = [
    		"use","class","style","ripple","color","variant","touch","href","action","defaultAction","secondary","component","getElement"
    	];

    	let $$restProps = compute_rest_props($$props, omit_props_names);
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Button', slots, ['default']);
    	const forwardEvents = forwardEventsBuilder(get_current_component());
    	let { use = [] } = $$props;
    	let { class: className = '' } = $$props;
    	let { style = '' } = $$props;
    	let { ripple = true } = $$props;
    	let { color = 'primary' } = $$props;
    	let { variant = 'text' } = $$props;
    	let { touch = false } = $$props;
    	let { href = undefined } = $$props;
    	let { action = 'close' } = $$props;
    	let { defaultAction = false } = $$props;
    	let { secondary = false } = $$props;
    	let element;
    	let internalClasses = {};
    	let internalStyles = {};
    	let context = getContext('SMUI:button:context');
    	let { component = href == null ? Button : A } = $$props;
    	let previousDisabled = $$restProps.disabled;
    	setContext('SMUI:label:context', 'button');
    	setContext('SMUI:icon:context', 'button');

    	function addClass(className) {
    		if (!internalClasses[className]) {
    			$$invalidate(11, internalClasses[className] = true, internalClasses);
    		}
    	}

    	function removeClass(className) {
    		if (!(className in internalClasses) || internalClasses[className]) {
    			$$invalidate(11, internalClasses[className] = false, internalClasses);
    		}
    	}

    	function addStyle(name, value) {
    		if (internalStyles[name] != value) {
    			if (value === '' || value == null) {
    				delete internalStyles[name];
    				$$invalidate(12, internalStyles);
    			} else {
    				$$invalidate(12, internalStyles[name] = value, internalStyles);
    			}
    		}
    	}

    	function handleClick() {
    		if (context === 'banner') {
    			dispatch(getElement(), secondary
    			? 'SMUIBannerButton:secondaryActionClick'
    			: 'SMUIBannerButton:primaryActionClick');
    		}
    	}

    	function getElement() {
    		return element.getElement();
    	}

    	function switch_instance_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			element = $$value;
    			$$invalidate(10, element);
    		});
    	}

    	$$self.$$set = $$new_props => {
    		$$invalidate(30, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
    		$$invalidate(22, $$restProps = compute_rest_props($$props, omit_props_names));
    		if ('use' in $$new_props) $$invalidate(0, use = $$new_props.use);
    		if ('class' in $$new_props) $$invalidate(1, className = $$new_props.class);
    		if ('style' in $$new_props) $$invalidate(2, style = $$new_props.style);
    		if ('ripple' in $$new_props) $$invalidate(3, ripple = $$new_props.ripple);
    		if ('color' in $$new_props) $$invalidate(4, color = $$new_props.color);
    		if ('variant' in $$new_props) $$invalidate(5, variant = $$new_props.variant);
    		if ('touch' in $$new_props) $$invalidate(6, touch = $$new_props.touch);
    		if ('href' in $$new_props) $$invalidate(7, href = $$new_props.href);
    		if ('action' in $$new_props) $$invalidate(23, action = $$new_props.action);
    		if ('defaultAction' in $$new_props) $$invalidate(24, defaultAction = $$new_props.defaultAction);
    		if ('secondary' in $$new_props) $$invalidate(8, secondary = $$new_props.secondary);
    		if ('component' in $$new_props) $$invalidate(9, component = $$new_props.component);
    		if ('$$scope' in $$new_props) $$invalidate(29, $$scope = $$new_props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		setContext,
    		getContext,
    		get_current_component,
    		forwardEventsBuilder,
    		classMap,
    		dispatch,
    		Ripple,
    		A,
    		Button,
    		forwardEvents,
    		use,
    		className,
    		style,
    		ripple,
    		color,
    		variant,
    		touch,
    		href,
    		action,
    		defaultAction,
    		secondary,
    		element,
    		internalClasses,
    		internalStyles,
    		context,
    		component,
    		previousDisabled,
    		addClass,
    		removeClass,
    		addStyle,
    		handleClick,
    		getElement,
    		secondaryProp,
    		defaultProp,
    		actionProp
    	});

    	$$self.$inject_state = $$new_props => {
    		$$invalidate(30, $$props = assign(assign({}, $$props), $$new_props));
    		if ('use' in $$props) $$invalidate(0, use = $$new_props.use);
    		if ('className' in $$props) $$invalidate(1, className = $$new_props.className);
    		if ('style' in $$props) $$invalidate(2, style = $$new_props.style);
    		if ('ripple' in $$props) $$invalidate(3, ripple = $$new_props.ripple);
    		if ('color' in $$props) $$invalidate(4, color = $$new_props.color);
    		if ('variant' in $$props) $$invalidate(5, variant = $$new_props.variant);
    		if ('touch' in $$props) $$invalidate(6, touch = $$new_props.touch);
    		if ('href' in $$props) $$invalidate(7, href = $$new_props.href);
    		if ('action' in $$props) $$invalidate(23, action = $$new_props.action);
    		if ('defaultAction' in $$props) $$invalidate(24, defaultAction = $$new_props.defaultAction);
    		if ('secondary' in $$props) $$invalidate(8, secondary = $$new_props.secondary);
    		if ('element' in $$props) $$invalidate(10, element = $$new_props.element);
    		if ('internalClasses' in $$props) $$invalidate(11, internalClasses = $$new_props.internalClasses);
    		if ('internalStyles' in $$props) $$invalidate(12, internalStyles = $$new_props.internalStyles);
    		if ('context' in $$props) $$invalidate(17, context = $$new_props.context);
    		if ('component' in $$props) $$invalidate(9, component = $$new_props.component);
    		if ('previousDisabled' in $$props) $$invalidate(26, previousDisabled = $$new_props.previousDisabled);
    		if ('secondaryProp' in $$props) $$invalidate(13, secondaryProp = $$new_props.secondaryProp);
    		if ('defaultProp' in $$props) $$invalidate(14, defaultProp = $$new_props.defaultProp);
    		if ('actionProp' in $$props) $$invalidate(15, actionProp = $$new_props.actionProp);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		$$invalidate(15, actionProp = context === 'dialog:action' && action != null
    		? { 'data-mdc-dialog-action': action }
    		: { action: $$props.action });

    		$$invalidate(14, defaultProp = context === 'dialog:action' && defaultAction
    		? { 'data-mdc-dialog-button-default': '' }
    		: { default: $$props.default });

    		$$invalidate(13, secondaryProp = context === 'banner'
    		? {}
    		: { secondary: $$props.secondary });

    		if (previousDisabled !== $$restProps.disabled) {
    			getElement().blur();
    			$$invalidate(26, previousDisabled = $$restProps.disabled);
    		}
    	};

    	$$props = exclude_internal_props($$props);

    	return [
    		use,
    		className,
    		style,
    		ripple,
    		color,
    		variant,
    		touch,
    		href,
    		secondary,
    		component,
    		element,
    		internalClasses,
    		internalStyles,
    		secondaryProp,
    		defaultProp,
    		actionProp,
    		forwardEvents,
    		context,
    		addClass,
    		removeClass,
    		addStyle,
    		handleClick,
    		$$restProps,
    		action,
    		defaultAction,
    		getElement,
    		previousDisabled,
    		slots,
    		switch_instance_binding,
    		$$scope
    	];
    }

    class Button_1 extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$2, create_fragment$4, safe_not_equal, {
    			use: 0,
    			class: 1,
    			style: 2,
    			ripple: 3,
    			color: 4,
    			variant: 5,
    			touch: 6,
    			href: 7,
    			action: 23,
    			defaultAction: 24,
    			secondary: 8,
    			component: 9,
    			getElement: 25
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Button_1",
    			options,
    			id: create_fragment$4.name
    		});
    	}

    	get use() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set use(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get class() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set class(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get style() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set style(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get ripple() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set ripple(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get color() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set color(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get variant() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set variant(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get touch() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set touch(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get href() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set href(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get action() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set action(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get defaultAction() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set defaultAction(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get secondary() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set secondary(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get component() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set component(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get getElement() {
    		return this.$$.ctx[25];
    	}

    	set getElement(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    class UserChoice {
        constructor(init) {
            Object.assign(this, init);
        }
    }

    /**
     * @license
     * Copyright 2020 Google Inc.
     *
     * Permission is hereby granted, free of charge, to any person obtaining a copy
     * of this software and associated documentation files (the "Software"), to deal
     * in the Software without restriction, including without limitation the rights
     * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
     * copies of the Software, and to permit persons to whom the Software is
     * furnished to do so, subject to the following conditions:
     *
     * The above copyright notice and this permission notice shall be included in
     * all copies or substantial portions of the Software.
     *
     * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
     * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
     * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
     * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
     * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
     * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
     * THE SOFTWARE.
     */
    /**
     * Style classes for segmented-button
     */
    var cssClasses$1 = {
        SINGLE_SELECT: 'mdc-segmented-button--single-select'
    };

    /**
     * @license
     * Copyright 2020 Google Inc.
     *
     * Permission is hereby granted, free of charge, to any person obtaining a copy
     * of this software and associated documentation files (the "Software"), to deal
     * in the Software without restriction, including without limitation the rights
     * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
     * copies of the Software, and to permit persons to whom the Software is
     * furnished to do so, subject to the following conditions:
     *
     * The above copyright notice and this permission notice shall be included in
     * all copies or substantial portions of the Software.
     *
     * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
     * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
     * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
     * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
     * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
     * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
     * THE SOFTWARE.
     */
    var MDCSegmentedButtonFoundation = /** @class */ (function (_super) {
        __extends(MDCSegmentedButtonFoundation, _super);
        function MDCSegmentedButtonFoundation(adapter) {
            return _super.call(this, __assign(__assign({}, MDCSegmentedButtonFoundation.defaultAdapter), adapter)) || this;
        }
        Object.defineProperty(MDCSegmentedButtonFoundation, "defaultAdapter", {
            get: function () {
                return {
                    hasClass: function () { return false; }, getSegments: function () { return []; },
                    selectSegment: function () { return undefined; },
                    unselectSegment: function () { return undefined; },
                    notifySelectedChange: function () { return undefined; }
                };
            },
            enumerable: false,
            configurable: true
        });
        /**
         * Sets identified child segment to be selected
         *
         * @param indexOrSegmentId Number index or string segmentId that identifies
         * child segment
         */
        MDCSegmentedButtonFoundation.prototype.selectSegment = function (indexOrSegmentId) {
            this.adapter.selectSegment(indexOrSegmentId);
        };
        /**
         * Sets identified child segment to be not selected
         *
         * @param indexOrSegmentId Number index or string segmentId that identifies
         * child segment
         */
        MDCSegmentedButtonFoundation.prototype.unselectSegment = function (indexOrSegmentId) {
            this.adapter.unselectSegment(indexOrSegmentId);
        };
        /**
         * @return Returns currently selected child segments as readonly list of
         * SegmentDetails
         */
        MDCSegmentedButtonFoundation.prototype.getSelectedSegments = function () {
            return this.adapter.getSegments().filter(function (segmentDetail) { return segmentDetail.selected; });
        };
        /**
         * @param indexOrSegmentId Number index or string segmentId that identifies
         * child segment
         * @return Returns true if identified child segment is currently selected,
         * otherwise returns false
         */
        MDCSegmentedButtonFoundation.prototype.isSegmentSelected = function (indexOrSegmentId) {
            return this.adapter.getSegments().some(function (segmentDetail) { return (segmentDetail.index === indexOrSegmentId ||
                segmentDetail.segmentId === indexOrSegmentId) &&
                segmentDetail.selected; });
        };
        /**
         * @return Returns true if segmented button is single select, otherwise
         * returns false
         */
        MDCSegmentedButtonFoundation.prototype.isSingleSelect = function () {
            return this.adapter.hasClass(cssClasses$1.SINGLE_SELECT);
        };
        /**
         * Called when child segment's selected status may have changed. If segmented
         * button is single select, unselects all child segments other than identified
         * child segment. Finally, emits event to client.
         *
         * @param detail Child segment affected represented as SegmentDetail
         * @event change With detail - SegmentDetail
         */
        MDCSegmentedButtonFoundation.prototype.handleSelected = function (detail) {
            if (this.isSingleSelect()) {
                this.unselectPrevSelected(detail.index);
            }
            this.adapter.notifySelectedChange(detail);
        };
        /**
         * Sets all child segments to be not selected except for child segment
         * identified by index
         *
         * @param index Index of child segment to not unselect
         */
        MDCSegmentedButtonFoundation.prototype.unselectPrevSelected = function (index) {
            var e_1, _a;
            try {
                for (var _b = __values(this.getSelectedSegments()), _c = _b.next(); !_c.done; _c = _b.next()) {
                    var selectedSegment = _c.value;
                    if (selectedSegment.index !== index) {
                        this.unselectSegment(selectedSegment.index);
                    }
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                }
                finally { if (e_1) throw e_1.error; }
            }
        };
        return MDCSegmentedButtonFoundation;
    }(MDCFoundation));

    /* node_modules\@smui\segmented-button\dist\SegmentedButton.svelte generated by Svelte v3.46.4 */
    const file$3 = "node_modules\\@smui\\segmented-button\\dist\\SegmentedButton.svelte";

    function get_each_context$2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[30] = list[i];
    	child_ctx[32] = i;
    	return child_ctx;
    }

    const get_default_slot_changes = dirty => ({ segment: dirty[0] & /*segments*/ 4 });
    const get_default_slot_context = ctx => ({ segment: /*segment*/ ctx[30] });

    // (18:6) <ContextFragment         key="SMUI:segmented-button:segment:initialSelected"         value={initialSelected[i]}       >
    function create_default_slot_1$2(ctx) {
    	let current;
    	const default_slot_template = /*#slots*/ ctx[16].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[21], get_default_slot_context);

    	const block = {
    		c: function create() {
    			if (default_slot) default_slot.c();
    		},
    		m: function mount(target, anchor) {
    			if (default_slot) {
    				default_slot.m(target, anchor);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty[0] & /*$$scope, segments*/ 2097156)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[21],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[21])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[21], dirty, get_default_slot_changes),
    						get_default_slot_context
    					);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_1$2.name,
    		type: "slot",
    		source: "(18:6) <ContextFragment         key=\\\"SMUI:segmented-button:segment:initialSelected\\\"         value={initialSelected[i]}       >",
    		ctx
    	});

    	return block;
    }

    // (17:4) <ContextFragment key="SMUI:segmented-button:segment:index" value={i}>
    function create_default_slot$2(ctx) {
    	let contextfragment;
    	let t;
    	let current;

    	contextfragment = new ContextFragment({
    			props: {
    				key: "SMUI:segmented-button:segment:initialSelected",
    				value: /*initialSelected*/ ctx[8][/*i*/ ctx[32]],
    				$$slots: { default: [create_default_slot_1$2] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(contextfragment.$$.fragment);
    			t = space();
    		},
    		m: function mount(target, anchor) {
    			mount_component(contextfragment, target, anchor);
    			insert_dev(target, t, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const contextfragment_changes = {};
    			if (dirty[0] & /*segments*/ 4) contextfragment_changes.value = /*initialSelected*/ ctx[8][/*i*/ ctx[32]];

    			if (dirty[0] & /*$$scope, segments*/ 2097156) {
    				contextfragment_changes.$$scope = { dirty, ctx };
    			}

    			contextfragment.$set(contextfragment_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(contextfragment.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(contextfragment.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(contextfragment, detaching);
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$2.name,
    		type: "slot",
    		source: "(17:4) <ContextFragment key=\\\"SMUI:segmented-button:segment:index\\\" value={i}>",
    		ctx
    	});

    	return block;
    }

    // (16:2) {#each segments as segment, i (key(segment))}
    function create_each_block$2(key_2, ctx) {
    	let first;
    	let contextfragment;
    	let current;

    	contextfragment = new ContextFragment({
    			props: {
    				key: "SMUI:segmented-button:segment:index",
    				value: /*i*/ ctx[32],
    				$$slots: { default: [create_default_slot$2] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		key: key_2,
    		first: null,
    		c: function create() {
    			first = empty();
    			create_component(contextfragment.$$.fragment);
    			this.first = first;
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, first, anchor);
    			mount_component(contextfragment, target, anchor);
    			current = true;
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			const contextfragment_changes = {};
    			if (dirty[0] & /*segments*/ 4) contextfragment_changes.value = /*i*/ ctx[32];

    			if (dirty[0] & /*$$scope, segments*/ 2097156) {
    				contextfragment_changes.$$scope = { dirty, ctx };
    			}

    			contextfragment.$set(contextfragment_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(contextfragment.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(contextfragment.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(first);
    			destroy_component(contextfragment, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$2.name,
    		type: "each",
    		source: "(16:2) {#each segments as segment, i (key(segment))}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$3(ctx) {
    	let div;
    	let each_blocks = [];
    	let each_1_lookup = new Map();
    	let div_class_value;
    	let div_role_value;
    	let useActions_action;
    	let current;
    	let mounted;
    	let dispose;
    	let each_value = /*segments*/ ctx[2];
    	validate_each_argument(each_value);
    	const get_key = ctx => /*key*/ ctx[3](/*segment*/ ctx[30]);
    	validate_each_keys(ctx, each_value, get_each_context$2, get_key);

    	for (let i = 0; i < each_value.length; i += 1) {
    		let child_ctx = get_each_context$2(ctx, each_value, i);
    		let key = get_key(child_ctx);
    		each_1_lookup.set(key, each_blocks[i] = create_each_block$2(key, child_ctx));
    	}

    	let div_levels = [
    		{
    			class: div_class_value = classMap({
    				[/*className*/ ctx[1]]: true,
    				'mdc-segmented-button': true,
    				'mdc-segmented-button--single-select': /*singleSelect*/ ctx[4]
    			})
    		},
    		{
    			role: div_role_value = /*singleSelect*/ ctx[4] ? 'radiogroup' : 'group'
    		},
    		/*$$restProps*/ ctx[12]
    	];

    	let div_data = {};

    	for (let i = 0; i < div_levels.length; i += 1) {
    		div_data = assign(div_data, div_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			div = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			set_attributes(div, div_data);
    			add_location(div, file$3, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}

    			/*div_binding*/ ctx[17](div);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					action_destroyer(useActions_action = useActions.call(null, div, /*use*/ ctx[0])),
    					action_destroyer(/*forwardEvents*/ ctx[7].call(null, div)),
    					listen_dev(div, "SMUISegmentedButtonSegment:mount", /*SMUISegmentedButtonSegment_mount_handler*/ ctx[18], false, false, false),
    					listen_dev(div, "SMUISegmentedButtonSegment:unmount", /*SMUISegmentedButtonSegment_unmount_handler*/ ctx[19], false, false, false),
    					listen_dev(div, "selected", /*selected_handler*/ ctx[20], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*segments, initialSelected, $$scope, key*/ 2097420) {
    				each_value = /*segments*/ ctx[2];
    				validate_each_argument(each_value);
    				group_outros();
    				validate_each_keys(ctx, each_value, get_each_context$2, get_key);
    				each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value, each_1_lookup, div, outro_and_destroy_block, create_each_block$2, null, get_each_context$2);
    				check_outros();
    			}

    			set_attributes(div, div_data = get_spread_update(div_levels, [
    				(!current || dirty[0] & /*className, singleSelect*/ 18 && div_class_value !== (div_class_value = classMap({
    					[/*className*/ ctx[1]]: true,
    					'mdc-segmented-button': true,
    					'mdc-segmented-button--single-select': /*singleSelect*/ ctx[4]
    				}))) && { class: div_class_value },
    				(!current || dirty[0] & /*singleSelect*/ 16 && div_role_value !== (div_role_value = /*singleSelect*/ ctx[4] ? 'radiogroup' : 'group')) && { role: div_role_value },
    				dirty[0] & /*$$restProps*/ 4096 && /*$$restProps*/ ctx[12]
    			]));

    			if (useActions_action && is_function(useActions_action.update) && dirty[0] & /*use*/ 1) useActions_action.update.call(null, /*use*/ ctx[0]);
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].d();
    			}

    			/*div_binding*/ ctx[17](null);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function setDifference(setA, setB) {
    	let _difference = new Set(setA);

    	for (let elem of setB) {
    		_difference.delete(elem);
    	}

    	return _difference;
    }

    function instance_1$1($$self, $$props, $$invalidate) {
    	const omit_props_names = ["use","class","segments","key","singleSelect","selected","getElement"];
    	let $$restProps = compute_rest_props($$props, omit_props_names);
    	let $singleSelectStore;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('SegmentedButton', slots, ['default']);
    	const forwardEvents = forwardEventsBuilder(get_current_component());
    	let { use = [] } = $$props;
    	let { class: className = '' } = $$props;
    	let { segments = [] } = $$props;
    	let { key = segment => segment } = $$props;
    	let { singleSelect = false } = $$props;
    	let { selected = singleSelect ? undefined : [] } = $$props;
    	let element;
    	let instance;
    	let segmentAccessorMap = {};
    	let segmentAccessorWeakMap = new WeakMap();
    	let initialSelected = segments.map(segmentId => singleSelect && selected === segmentId || !singleSelect && selected.indexOf(segmentId) !== -1);
    	setContext('SMUI:icon:context', 'segmented-button');
    	setContext('SMUI:label:context', 'segmented-button');
    	const singleSelectStore = writable(singleSelect);
    	validate_store(singleSelectStore, 'singleSelectStore');
    	component_subscribe($$self, singleSelectStore, value => $$invalidate(23, $singleSelectStore = value));
    	setContext('SMUI:segmented-button:singleSelect', singleSelectStore);
    	let previousSelected = singleSelect ? selected : new Set(selected);

    	onMount(() => {
    		$$invalidate(5, instance = new MDCSegmentedButtonFoundation({
    				hasClass: className => {
    					return getElement().classList.contains(className);
    				},
    				getSegments: () => {
    					return segments.map((segment, index) => ({
    						index,
    						selected: singleSelect
    						? selected === segment
    						: selected.indexOf(segment) !== -1
    					})); // segmentId: segment, // Not necessarily a string.
    				},
    				selectSegment,
    				unselectSegment,
    				notifySelectedChange: detail => {
    					if (detail.selected) {
    						selectSegment(detail.index);
    					} else {
    						unselectSegment(detail.index);
    					}

    					dispatch(getElement(), 'change', detail);
    				}
    			}));

    		instance.init();

    		return () => {
    			instance.destroy();
    		};
    	});

    	function handleSegmentMount(event) {
    		const accessor = event.detail;
    		addAccessor(accessor.segmentId, accessor);
    	}

    	function handleSegmentUnmount(event) {
    		const accessor = event.detail;
    		removeAccessor(accessor.segmentId);
    	}

    	function getAccessor(segmentId) {
    		return segmentId instanceof Object
    		? segmentAccessorWeakMap.get(segmentId)
    		: segmentAccessorMap[segmentId];
    	}

    	function addAccessor(segmentId, accessor) {
    		if (segmentId instanceof Object) {
    			segmentAccessorWeakMap.set(segmentId, accessor);
    		} else {
    			segmentAccessorMap[segmentId] = accessor;
    		}
    	}

    	function removeAccessor(segmentId) {
    		if (segmentId instanceof Object) {
    			segmentAccessorWeakMap.delete(segmentId);
    		} else {
    			delete segmentAccessorMap[segmentId];
    		}
    	}

    	function selectSegment(indexOrSegmentId) {
    		let index = segments.indexOf(indexOrSegmentId);

    		if (index === -1) {
    			index = indexOrSegmentId;
    		}

    		if (!singleSelect) {
    			const selIndex = selected.indexOf(segments[index]);

    			if (selIndex === -1) {
    				selected.push(segments[index]);
    				$$invalidate(13, selected);
    			}
    		} else if (selected !== segments[index]) {
    			$$invalidate(13, selected = segments[index]);
    		}

    		const accessor = getAccessor(segments[index]);

    		if (accessor) {
    			accessor.selected = true;
    		}
    	}

    	function unselectSegment(indexOrSegmentId) {
    		let index = segments.indexOf(indexOrSegmentId);

    		if (index === -1) {
    			index = indexOrSegmentId;
    		}

    		if (!singleSelect) {
    			const selIndex = selected.indexOf(segments[index]);

    			if (selIndex !== -1) {
    				selected.splice(selIndex, 1);
    				$$invalidate(13, selected);
    			}
    		} else if (selected === segments[index]) {
    			$$invalidate(13, selected = null);
    		}

    		const accessor = getAccessor(segments[index]);

    		if (accessor) {
    			accessor.selected = false;
    		}
    	}

    	function getElement() {
    		return element;
    	}

    	function div_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			element = $$value;
    			$$invalidate(6, element);
    		});
    	}

    	const SMUISegmentedButtonSegment_mount_handler = event => handleSegmentMount(event);
    	const SMUISegmentedButtonSegment_unmount_handler = event => handleSegmentUnmount(event);
    	const selected_handler = event => instance && instance.handleSelected(event.detail);

    	$$self.$$set = $$new_props => {
    		$$props = assign(assign({}, $$props), exclude_internal_props($$new_props));
    		$$invalidate(12, $$restProps = compute_rest_props($$props, omit_props_names));
    		if ('use' in $$new_props) $$invalidate(0, use = $$new_props.use);
    		if ('class' in $$new_props) $$invalidate(1, className = $$new_props.class);
    		if ('segments' in $$new_props) $$invalidate(2, segments = $$new_props.segments);
    		if ('key' in $$new_props) $$invalidate(3, key = $$new_props.key);
    		if ('singleSelect' in $$new_props) $$invalidate(4, singleSelect = $$new_props.singleSelect);
    		if ('selected' in $$new_props) $$invalidate(13, selected = $$new_props.selected);
    		if ('$$scope' in $$new_props) $$invalidate(21, $$scope = $$new_props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		MDCSegmentedButtonFoundation,
    		onMount,
    		setContext,
    		writable,
    		get_current_component,
    		forwardEventsBuilder,
    		classMap,
    		useActions,
    		dispatch,
    		ContextFragment,
    		forwardEvents,
    		use,
    		className,
    		segments,
    		key,
    		singleSelect,
    		selected,
    		element,
    		instance,
    		segmentAccessorMap,
    		segmentAccessorWeakMap,
    		initialSelected,
    		singleSelectStore,
    		previousSelected,
    		setDifference,
    		handleSegmentMount,
    		handleSegmentUnmount,
    		getAccessor,
    		addAccessor,
    		removeAccessor,
    		selectSegment,
    		unselectSegment,
    		getElement,
    		$singleSelectStore
    	});

    	$$self.$inject_state = $$new_props => {
    		if ('use' in $$props) $$invalidate(0, use = $$new_props.use);
    		if ('className' in $$props) $$invalidate(1, className = $$new_props.className);
    		if ('segments' in $$props) $$invalidate(2, segments = $$new_props.segments);
    		if ('key' in $$props) $$invalidate(3, key = $$new_props.key);
    		if ('singleSelect' in $$props) $$invalidate(4, singleSelect = $$new_props.singleSelect);
    		if ('selected' in $$props) $$invalidate(13, selected = $$new_props.selected);
    		if ('element' in $$props) $$invalidate(6, element = $$new_props.element);
    		if ('instance' in $$props) $$invalidate(5, instance = $$new_props.instance);
    		if ('segmentAccessorMap' in $$props) segmentAccessorMap = $$new_props.segmentAccessorMap;
    		if ('segmentAccessorWeakMap' in $$props) segmentAccessorWeakMap = $$new_props.segmentAccessorWeakMap;
    		if ('initialSelected' in $$props) $$invalidate(8, initialSelected = $$new_props.initialSelected);
    		if ('previousSelected' in $$props) $$invalidate(15, previousSelected = $$new_props.previousSelected);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty[0] & /*singleSelect*/ 16) {
    			set_store_value(singleSelectStore, $singleSelectStore = singleSelect, $singleSelectStore);
    		}

    		if ($$self.$$.dirty[0] & /*instance, singleSelect, previousSelected, selected*/ 41008) {
    			if (instance && singleSelect && previousSelected !== selected) {
    				if (previousSelected != null) {
    					instance.unselectSegment(previousSelected);
    				}

    				$$invalidate(15, previousSelected = selected);

    				if (selected != null) {
    					instance.selectSegment(selected);
    				}
    			}
    		}

    		if ($$self.$$.dirty[0] & /*instance, singleSelect, selected, previousSelected, segments*/ 41012) {
    			if (instance && !singleSelect) {
    				const setSelected = new Set(selected);
    				const unSelected = setDifference(previousSelected, setSelected);
    				const newSelected = setDifference(setSelected, previousSelected);

    				if (unSelected.size || newSelected.size) {
    					$$invalidate(15, previousSelected = setSelected);

    					for (let segmentId of unSelected) {
    						const idx = segments.indexOf(segmentId);

    						if (idx !== -1) {
    							instance.unselectSegment(idx);
    						}
    					}

    					for (let segmentId of newSelected) {
    						instance.selectSegment(segments.indexOf(segmentId));
    					}
    				}
    			}
    		}
    	};

    	return [
    		use,
    		className,
    		segments,
    		key,
    		singleSelect,
    		instance,
    		element,
    		forwardEvents,
    		initialSelected,
    		singleSelectStore,
    		handleSegmentMount,
    		handleSegmentUnmount,
    		$$restProps,
    		selected,
    		getElement,
    		previousSelected,
    		slots,
    		div_binding,
    		SMUISegmentedButtonSegment_mount_handler,
    		SMUISegmentedButtonSegment_unmount_handler,
    		selected_handler,
    		$$scope
    	];
    }

    class SegmentedButton extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(
    			this,
    			options,
    			instance_1$1,
    			create_fragment$3,
    			safe_not_equal,
    			{
    				use: 0,
    				class: 1,
    				segments: 2,
    				key: 3,
    				singleSelect: 4,
    				selected: 13,
    				getElement: 14
    			},
    			null,
    			[-1, -1]
    		);

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "SegmentedButton",
    			options,
    			id: create_fragment$3.name
    		});
    	}

    	get use() {
    		throw new Error("<SegmentedButton>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set use(value) {
    		throw new Error("<SegmentedButton>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get class() {
    		throw new Error("<SegmentedButton>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set class(value) {
    		throw new Error("<SegmentedButton>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get segments() {
    		throw new Error("<SegmentedButton>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set segments(value) {
    		throw new Error("<SegmentedButton>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get key() {
    		throw new Error("<SegmentedButton>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set key(value) {
    		throw new Error("<SegmentedButton>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get singleSelect() {
    		throw new Error("<SegmentedButton>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set singleSelect(value) {
    		throw new Error("<SegmentedButton>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get selected() {
    		throw new Error("<SegmentedButton>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set selected(value) {
    		throw new Error("<SegmentedButton>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get getElement() {
    		return this.$$.ctx[14];
    	}

    	set getElement(value) {
    		throw new Error("<SegmentedButton>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /**
     * @license
     * Copyright 2020 Google Inc.
     *
     * Permission is hereby granted, free of charge, to any person obtaining a copy
     * of this software and associated documentation files (the "Software"), to deal
     * in the Software without restriction, including without limitation the rights
     * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
     * copies of the Software, and to permit persons to whom the Software is
     * furnished to do so, subject to the following conditions:
     *
     * The above copyright notice and this permission notice shall be included in
     * all copies or substantial portions of the Software.
     *
     * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
     * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
     * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
     * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
     * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
     * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
     * THE SOFTWARE.
     */
    /**
     * Boolean strings for segment
     */
    var booleans = {
        TRUE: 'true',
        FALSE: 'false'
    };
    /**
     * Attributes referenced by segment
     */
    var attributes = {
        ARIA_CHECKED: 'aria-checked',
        ARIA_PRESSED: 'aria-pressed',
        DATA_SEGMENT_ID: 'data-segment-id'
    };
    /**
     * Style classes for segment
     */
    var cssClasses = {
        SELECTED: 'mdc-segmented-button__segment--selected'
    };

    /**
     * @license
     * Copyright 2020 Google Inc.
     *
     * Permission is hereby granted, free of charge, to any person obtaining a copy
     * of this software and associated documentation files (the "Software"), to deal
     * in the Software without restriction, including without limitation the rights
     * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
     * copies of the Software, and to permit persons to whom the Software is
     * furnished to do so, subject to the following conditions:
     *
     * The above copyright notice and this permission notice shall be included in
     * all copies or substantial portions of the Software.
     *
     * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
     * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
     * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
     * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
     * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
     * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
     * THE SOFTWARE.
     */
    var emptyClientRect = {
        bottom: 0,
        height: 0,
        left: 0,
        right: 0,
        top: 0,
        width: 0,
    };
    var MDCSegmentedButtonSegmentFoundation = /** @class */ (function (_super) {
        __extends(MDCSegmentedButtonSegmentFoundation, _super);
        function MDCSegmentedButtonSegmentFoundation(adapter) {
            return _super.call(this, __assign(__assign({}, MDCSegmentedButtonSegmentFoundation.defaultAdapter), adapter)) || this;
        }
        Object.defineProperty(MDCSegmentedButtonSegmentFoundation, "defaultAdapter", {
            get: function () {
                return {
                    isSingleSelect: function () { return false; }, getAttr: function () { return ''; }, setAttr: function () { return undefined; },
                    addClass: function () { return undefined; }, removeClass: function () { return undefined; },
                    hasClass: function () { return false; },
                    notifySelectedChange: function () { return undefined; },
                    getRootBoundingClientRect: function () { return emptyClientRect; },
                };
            },
            enumerable: false,
            configurable: true
        });
        /**
         * @return Returns true if segment is currently selected, otherwise returns
         * false
         */
        MDCSegmentedButtonSegmentFoundation.prototype.isSelected = function () {
            return this.adapter.hasClass(cssClasses.SELECTED);
        };
        /**
         * Sets segment to be selected
         */
        MDCSegmentedButtonSegmentFoundation.prototype.setSelected = function () {
            this.adapter.addClass(cssClasses.SELECTED);
            this.setAriaAttr(booleans.TRUE);
        };
        /**
         * Sets segment to be not selected
         */
        MDCSegmentedButtonSegmentFoundation.prototype.setUnselected = function () {
            this.adapter.removeClass(cssClasses.SELECTED);
            this.setAriaAttr(booleans.FALSE);
        };
        /**
         * @return Returns segment's segmentId if it was set by client
         */
        MDCSegmentedButtonSegmentFoundation.prototype.getSegmentId = function () {
            var _a;
            return (_a = this.adapter.getAttr(attributes.DATA_SEGMENT_ID)) !== null && _a !== void 0 ? _a : undefined;
        };
        /**
         * Called when segment is clicked. If the wrapping segmented button is single
         * select, doesn't allow segment to be set to not selected. Otherwise, toggles
         * segment's selected status. Finally, emits event to wrapping segmented
         * button.
         *
         * @event selected With detail - SegmentDetail
         */
        MDCSegmentedButtonSegmentFoundation.prototype.handleClick = function () {
            if (this.adapter.isSingleSelect()) {
                this.setSelected();
            }
            else {
                this.toggleSelection();
            }
            this.adapter.notifySelectedChange(this.isSelected());
        };
        /**
         * @return Returns bounding rectangle for ripple effect
         */
        MDCSegmentedButtonSegmentFoundation.prototype.getDimensions = function () {
            return this.adapter.getRootBoundingClientRect();
        };
        /**
         * Sets segment from not selected to selected, or selected to not selected
         */
        MDCSegmentedButtonSegmentFoundation.prototype.toggleSelection = function () {
            if (this.isSelected()) {
                this.setUnselected();
            }
            else {
                this.setSelected();
            }
        };
        /**
         * Sets appropriate aria attribute, based on wrapping segmented button's
         * single selected value, to new value
         *
         * @param value Value that represents selected status
         */
        MDCSegmentedButtonSegmentFoundation.prototype.setAriaAttr = function (value) {
            if (this.adapter.isSingleSelect()) {
                this.adapter.setAttr(attributes.ARIA_CHECKED, value);
            }
            else {
                this.adapter.setAttr(attributes.ARIA_PRESSED, value);
            }
        };
        return MDCSegmentedButtonSegmentFoundation;
    }(MDCFoundation));

    /* node_modules\@smui\segmented-button\dist\Segment.svelte generated by Svelte v3.46.4 */

    const { Error: Error_1 } = globals;
    const file$2 = "node_modules\\@smui\\segmented-button\\dist\\Segment.svelte";

    // (33:3) {#if ripple}
    function create_if_block_1$2(ctx) {
    	let div;

    	const block = {
    		c: function create() {
    			div = element("div");
    			attr_dev(div, "class", "mdc-segmented-button__ripple");
    			add_location(div, file$2, 32, 15, 894);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$2.name,
    		type: "if",
    		source: "(33:3) {#if ripple}",
    		ctx
    	});

    	return block;
    }

    // (34:4) {#if touch}
    function create_if_block$2(ctx) {
    	let div;

    	const block = {
    		c: function create() {
    			div = element("div");
    			attr_dev(div, "class", "mdc-segmented-button__segment__touch");
    			add_location(div, file$2, 33, 15, 964);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$2.name,
    		type: "if",
    		source: "(34:4) {#if touch}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$2(ctx) {
    	let button;
    	let if_block0_anchor;
    	let button_class_value;
    	let button_style_value;
    	let button_role_value;
    	let button_aria_pressed_value;
    	let button_aria_checked_value;
    	let Ripple_action;
    	let useActions_action;
    	let current;
    	let mounted;
    	let dispose;
    	let if_block0 = /*ripple*/ ctx[4] && create_if_block_1$2(ctx);
    	const default_slot_template = /*#slots*/ ctx[23].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[22], null);
    	let if_block1 = /*touch*/ ctx[5] && create_if_block$2(ctx);

    	let button_levels = [
    		{
    			class: button_class_value = classMap({
    				[/*className*/ ctx[2]]: true,
    				'mdc-segmented-button__segment': true,
    				'mdc-segmented-button__segment--touch': /*touch*/ ctx[5],
    				'mdc-segmented-button__segment--selected': /*selected*/ ctx[0],
    				.../*internalClasses*/ ctx[8]
    			})
    		},
    		{
    			style: button_style_value = Object.entries(/*internalStyles*/ ctx[9]).map(func).concat([/*style*/ ctx[3]]).join(' ')
    		},
    		{
    			role: button_role_value = /*singleSelect*/ ctx[14] ? 'radio' : undefined
    		},
    		{
    			"aria-pressed": button_aria_pressed_value = !/*singleSelect*/ ctx[14]
    			? /*selected*/ ctx[0] ? 'true' : 'false'
    			: undefined
    		},
    		{
    			"aria-checked": button_aria_checked_value = /*singleSelect*/ ctx[14]
    			? /*selected*/ ctx[0] ? 'true' : 'false'
    			: undefined
    		},
    		/*internalAttrs*/ ctx[10],
    		/*$$restProps*/ ctx[19]
    	];

    	let button_data = {};

    	for (let i = 0; i < button_levels.length; i += 1) {
    		button_data = assign(button_data, button_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			button = element("button");
    			if (if_block0) if_block0.c();
    			if_block0_anchor = empty();
    			if (default_slot) default_slot.c();
    			if (if_block1) if_block1.c();
    			set_attributes(button, button_data);
    			add_location(button, file$2, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error_1("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);
    			if (if_block0) if_block0.m(button, null);
    			append_dev(button, if_block0_anchor);

    			if (default_slot) {
    				default_slot.m(button, null);
    			}

    			if (if_block1) if_block1.m(button, null);
    			if (button.autofocus) button.focus();
    			/*button_binding*/ ctx[24](button);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					action_destroyer(Ripple_action = Ripple.call(null, button, {
    						ripple: /*ripple*/ ctx[4],
    						unbounded: false,
    						addClass: /*addClass*/ ctx[16],
    						removeClass: /*removeClass*/ ctx[17],
    						addStyle: /*addStyle*/ ctx[18]
    					})),
    					action_destroyer(/*forwardEvents*/ ctx[11].call(null, button)),
    					action_destroyer(useActions_action = useActions.call(null, button, /*use*/ ctx[1])),
    					listen_dev(button, "click", /*click_handler*/ ctx[25], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (/*ripple*/ ctx[4]) {
    				if (if_block0) ; else {
    					if_block0 = create_if_block_1$2(ctx);
    					if_block0.c();
    					if_block0.m(button, if_block0_anchor);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (default_slot) {
    				if (default_slot.p && (!current || dirty[0] & /*$$scope*/ 4194304)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[22],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[22])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[22], dirty, null),
    						null
    					);
    				}
    			}

    			if (/*touch*/ ctx[5]) {
    				if (if_block1) ; else {
    					if_block1 = create_if_block$2(ctx);
    					if_block1.c();
    					if_block1.m(button, null);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}

    			set_attributes(button, button_data = get_spread_update(button_levels, [
    				(!current || dirty[0] & /*className, touch, selected, internalClasses*/ 293 && button_class_value !== (button_class_value = classMap({
    					[/*className*/ ctx[2]]: true,
    					'mdc-segmented-button__segment': true,
    					'mdc-segmented-button__segment--touch': /*touch*/ ctx[5],
    					'mdc-segmented-button__segment--selected': /*selected*/ ctx[0],
    					.../*internalClasses*/ ctx[8]
    				}))) && { class: button_class_value },
    				(!current || dirty[0] & /*internalStyles, style*/ 520 && button_style_value !== (button_style_value = Object.entries(/*internalStyles*/ ctx[9]).map(func).concat([/*style*/ ctx[3]]).join(' '))) && { style: button_style_value },
    				{ role: button_role_value },
    				(!current || dirty[0] & /*selected*/ 1 && button_aria_pressed_value !== (button_aria_pressed_value = !/*singleSelect*/ ctx[14]
    				? /*selected*/ ctx[0] ? 'true' : 'false'
    				: undefined)) && {
    					"aria-pressed": button_aria_pressed_value
    				},
    				(!current || dirty[0] & /*selected*/ 1 && button_aria_checked_value !== (button_aria_checked_value = /*singleSelect*/ ctx[14]
    				? /*selected*/ ctx[0] ? 'true' : 'false'
    				: undefined)) && {
    					"aria-checked": button_aria_checked_value
    				},
    				dirty[0] & /*internalAttrs*/ 1024 && /*internalAttrs*/ ctx[10],
    				dirty[0] & /*$$restProps*/ 524288 && /*$$restProps*/ ctx[19]
    			]));

    			if (Ripple_action && is_function(Ripple_action.update) && dirty[0] & /*ripple*/ 16) Ripple_action.update.call(null, {
    				ripple: /*ripple*/ ctx[4],
    				unbounded: false,
    				addClass: /*addClass*/ ctx[16],
    				removeClass: /*removeClass*/ ctx[17],
    				addStyle: /*addStyle*/ ctx[18]
    			});

    			if (useActions_action && is_function(useActions_action.update) && dirty[0] & /*use*/ 2) useActions_action.update.call(null, /*use*/ ctx[1]);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			if (if_block0) if_block0.d();
    			if (default_slot) default_slot.d(detaching);
    			if (if_block1) if_block1.d();
    			/*button_binding*/ ctx[24](null);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    const func = ([name, value]) => `${name}: ${value};`;

    function instance_1($$self, $$props, $$invalidate) {
    	const omit_props_names = ["use","class","style","segment","ripple","touch","selected","getElement"];
    	let $$restProps = compute_rest_props($$props, omit_props_names);
    	let $index;
    	let $singleSelect;
    	let $initialSelectedStore;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Segment', slots, ['default']);
    	const forwardEvents = forwardEventsBuilder(get_current_component());

    	let uninitializedValue = () => {
    		
    	};

    	function isUninitializedValue(value) {
    		return value === uninitializedValue;
    	}

    	let { use = [] } = $$props;
    	let { class: className = '' } = $$props;
    	let { style = '' } = $$props;
    	let { segment: segmentId } = $$props;
    	let { ripple = true } = $$props;
    	let { touch = false } = $$props;
    	const initialSelectedStore = getContext('SMUI:segmented-button:segment:initialSelected');
    	validate_store(initialSelectedStore, 'initialSelectedStore');
    	component_subscribe($$self, initialSelectedStore, value => $$invalidate(28, $initialSelectedStore = value));
    	let { selected = uninitializedValue } = $$props;
    	let manualSelection = !isUninitializedValue(selected);

    	if (isUninitializedValue(selected)) {
    		selected = $initialSelectedStore;
    	}

    	// Done with the trickery.
    	let element;

    	let instance;
    	let internalClasses = {};
    	let internalStyles = {};
    	let internalAttrs = {};
    	const singleSelect = getContext('SMUI:segmented-button:singleSelect');
    	validate_store(singleSelect, 'singleSelect');
    	component_subscribe($$self, singleSelect, value => $$invalidate(27, $singleSelect = value));
    	const index = getContext('SMUI:segmented-button:segment:index');
    	validate_store(index, 'index');
    	component_subscribe($$self, index, value => $$invalidate(26, $index = value));

    	if (!segmentId) {
    		throw new Error('The segment property is required! It should be passed down from the SegmentedButton to the Segment.');
    	}

    	onMount(() => {
    		$$invalidate(6, instance = new MDCSegmentedButtonSegmentFoundation({
    				isSingleSelect: () => {
    					return $singleSelect;
    				},
    				getAttr,
    				setAttr: addAttr,
    				addClass,
    				removeClass,
    				hasClass,
    				notifySelectedChange: value => {
    					$$invalidate(0, selected = value);
    					dispatch(getElement(), 'selected', { index: $index, selected, segmentId });
    				},
    				getRootBoundingClientRect: () => {
    					return getElement().getBoundingClientRect();
    				}
    			}));

    		const accessor = {
    			segmentId,
    			get selected() {
    				return selected;
    			},
    			set selected(value) {
    				if (selected !== value) {
    					$$invalidate(0, selected = value);
    				}
    			}
    		};

    		dispatch(getElement(), 'SMUISegmentedButtonSegment:mount', accessor);
    		instance.init();

    		return () => {
    			dispatch(getElement(), 'SMUISegmentedButtonSegment:unmount', accessor);
    			instance.destroy();
    		};
    	});

    	function hasClass(className) {
    		return className in internalClasses
    		? internalClasses[className]
    		: getElement().classList.contains(className);
    	}

    	function addClass(className) {
    		if (!internalClasses[className]) {
    			$$invalidate(8, internalClasses[className] = true, internalClasses);
    		}
    	}

    	function removeClass(className) {
    		if (!(className in internalClasses) || internalClasses[className]) {
    			$$invalidate(8, internalClasses[className] = false, internalClasses);
    		}
    	}

    	function getAttr(name) {
    		var _a;

    		return name in internalAttrs
    		? (_a = internalAttrs[name]) !== null && _a !== void 0
    			? _a
    			: null
    		: getElement().getAttribute(name);
    	}

    	function addAttr(name, value) {
    		if (internalAttrs[name] !== value) {
    			$$invalidate(10, internalAttrs[name] = value, internalAttrs);
    		}
    	}

    	function addStyle(name, value) {
    		if (internalStyles[name] != value) {
    			if (value === '' || value == null) {
    				delete internalStyles[name];
    				$$invalidate(9, internalStyles);
    			} else {
    				$$invalidate(9, internalStyles[name] = value, internalStyles);
    			}
    		}
    	}

    	function getElement() {
    		return element;
    	}

    	function button_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			element = $$value;
    			$$invalidate(7, element);
    		});
    	}

    	const click_handler = event => !event.defaultPrevented && instance && !manualSelection && instance.handleClick();

    	$$self.$$set = $$new_props => {
    		$$props = assign(assign({}, $$props), exclude_internal_props($$new_props));
    		$$invalidate(19, $$restProps = compute_rest_props($$props, omit_props_names));
    		if ('use' in $$new_props) $$invalidate(1, use = $$new_props.use);
    		if ('class' in $$new_props) $$invalidate(2, className = $$new_props.class);
    		if ('style' in $$new_props) $$invalidate(3, style = $$new_props.style);
    		if ('segment' in $$new_props) $$invalidate(20, segmentId = $$new_props.segment);
    		if ('ripple' in $$new_props) $$invalidate(4, ripple = $$new_props.ripple);
    		if ('touch' in $$new_props) $$invalidate(5, touch = $$new_props.touch);
    		if ('selected' in $$new_props) $$invalidate(0, selected = $$new_props.selected);
    		if ('$$scope' in $$new_props) $$invalidate(22, $$scope = $$new_props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		MDCSegmentedButtonSegmentFoundation,
    		onMount,
    		getContext,
    		get_current_component,
    		forwardEventsBuilder,
    		classMap,
    		useActions,
    		dispatch,
    		Ripple,
    		forwardEvents,
    		uninitializedValue,
    		isUninitializedValue,
    		use,
    		className,
    		style,
    		segmentId,
    		ripple,
    		touch,
    		initialSelectedStore,
    		selected,
    		manualSelection,
    		element,
    		instance,
    		internalClasses,
    		internalStyles,
    		internalAttrs,
    		singleSelect,
    		index,
    		hasClass,
    		addClass,
    		removeClass,
    		getAttr,
    		addAttr,
    		addStyle,
    		getElement,
    		$index,
    		$singleSelect,
    		$initialSelectedStore
    	});

    	$$self.$inject_state = $$new_props => {
    		if ('uninitializedValue' in $$props) uninitializedValue = $$new_props.uninitializedValue;
    		if ('use' in $$props) $$invalidate(1, use = $$new_props.use);
    		if ('className' in $$props) $$invalidate(2, className = $$new_props.className);
    		if ('style' in $$props) $$invalidate(3, style = $$new_props.style);
    		if ('segmentId' in $$props) $$invalidate(20, segmentId = $$new_props.segmentId);
    		if ('ripple' in $$props) $$invalidate(4, ripple = $$new_props.ripple);
    		if ('touch' in $$props) $$invalidate(5, touch = $$new_props.touch);
    		if ('selected' in $$props) $$invalidate(0, selected = $$new_props.selected);
    		if ('manualSelection' in $$props) $$invalidate(13, manualSelection = $$new_props.manualSelection);
    		if ('element' in $$props) $$invalidate(7, element = $$new_props.element);
    		if ('instance' in $$props) $$invalidate(6, instance = $$new_props.instance);
    		if ('internalClasses' in $$props) $$invalidate(8, internalClasses = $$new_props.internalClasses);
    		if ('internalStyles' in $$props) $$invalidate(9, internalStyles = $$new_props.internalStyles);
    		if ('internalAttrs' in $$props) $$invalidate(10, internalAttrs = $$new_props.internalAttrs);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty[0] & /*instance, selected*/ 65) {
    			if (instance && instance.isSelected() && !selected) {
    				instance.setUnselected();
    			}
    		}

    		if ($$self.$$.dirty[0] & /*instance, selected*/ 65) {
    			if (instance && !instance.isSelected() && selected) {
    				instance.setSelected();
    			}
    		}
    	};

    	return [
    		selected,
    		use,
    		className,
    		style,
    		ripple,
    		touch,
    		instance,
    		element,
    		internalClasses,
    		internalStyles,
    		internalAttrs,
    		forwardEvents,
    		initialSelectedStore,
    		manualSelection,
    		singleSelect,
    		index,
    		addClass,
    		removeClass,
    		addStyle,
    		$$restProps,
    		segmentId,
    		getElement,
    		$$scope,
    		slots,
    		button_binding,
    		click_handler
    	];
    }

    class Segment$1 extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(
    			this,
    			options,
    			instance_1,
    			create_fragment$2,
    			safe_not_equal,
    			{
    				use: 1,
    				class: 2,
    				style: 3,
    				segment: 20,
    				ripple: 4,
    				touch: 5,
    				selected: 0,
    				getElement: 21
    			},
    			null,
    			[-1, -1]
    		);

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Segment",
    			options,
    			id: create_fragment$2.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*segmentId*/ ctx[20] === undefined && !('segment' in props)) {
    			console.warn("<Segment> was created without expected prop 'segment'");
    		}
    	}

    	get use() {
    		throw new Error_1("<Segment>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set use(value) {
    		throw new Error_1("<Segment>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get class() {
    		throw new Error_1("<Segment>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set class(value) {
    		throw new Error_1("<Segment>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get style() {
    		throw new Error_1("<Segment>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set style(value) {
    		throw new Error_1("<Segment>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get segment() {
    		throw new Error_1("<Segment>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set segment(value) {
    		throw new Error_1("<Segment>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get ripple() {
    		throw new Error_1("<Segment>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set ripple(value) {
    		throw new Error_1("<Segment>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get touch() {
    		throw new Error_1("<Segment>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set touch(value) {
    		throw new Error_1("<Segment>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get selected() {
    		throw new Error_1("<Segment>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set selected(value) {
    		throw new Error_1("<Segment>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get getElement() {
    		return this.$$.ctx[21];
    	}

    	set getElement(value) {
    		throw new Error_1("<Segment>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    const Segment = Segment$1;

    /* src\Guide.svelte generated by Svelte v3.46.4 */

    const { Object: Object_1$1 } = globals;
    const file$1 = "src\\Guide.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[21] = list[i];
    	child_ctx[23] = i;
    	return child_ctx;
    }

    // (115:0) {#if currentGuideStep }
    function create_if_block$1(ctx) {
    	let ul;
    	let t;
    	let if_block_anchor;
    	let current;
    	let each_value = /*userChoices*/ ctx[1];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	let if_block = /*visibleCard*/ ctx[5] && create_if_block_1$1(ctx);

    	const block = {
    		c: function create() {
    			ul = element("ul");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t = space();
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    			attr_dev(ul, "class", "breadcrumb svelte-190ooxt");
    			add_location(ul, file$1, 115, 4, 4014);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, ul, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(ul, null);
    			}

    			insert_dev(target, t, anchor);
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*handleClickBreadcrumb, userChoices, currentUserChoiceIdx*/ 259) {
    				each_value = /*userChoices*/ ctx[1];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$1(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block$1(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(ul, null);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}

    			if (/*visibleCard*/ ctx[5]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*visibleCard*/ 32) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block_1$1(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(ul);
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(t);
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(115:0) {#if currentGuideStep }",
    		ctx
    	});

    	return block;
    }

    // (118:12) {#if userChoiceIdx <= currentUserChoiceIdx}
    function create_if_block_5(ctx) {
    	let li;
    	let current_block_type_index;
    	let if_block;
    	let t;
    	let li_intro;
    	let li_outro;
    	let current;
    	const if_block_creators = [create_if_block_6, create_if_block_7];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*userChoiceIdx*/ ctx[23] < /*currentUserChoiceIdx*/ ctx[0]) return 0;
    		if (/*userChoiceIdx*/ ctx[23] == /*currentUserChoiceIdx*/ ctx[0]) return 1;
    		return -1;
    	}

    	if (~(current_block_type_index = select_block_type(ctx))) {
    		if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    	}

    	const block = {
    		c: function create() {
    			li = element("li");
    			if (if_block) if_block.c();
    			t = space();
    			attr_dev(li, "class", "svelte-190ooxt");
    			add_location(li, file$1, 118, 16, 4169);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li, anchor);

    			if (~current_block_type_index) {
    				if_blocks[current_block_type_index].m(li, null);
    			}

    			append_dev(li, t);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if (~current_block_type_index) {
    					if_blocks[current_block_type_index].p(ctx, dirty);
    				}
    			} else {
    				if (if_block) {
    					group_outros();

    					transition_out(if_blocks[previous_block_index], 1, 1, () => {
    						if_blocks[previous_block_index] = null;
    					});

    					check_outros();
    				}

    				if (~current_block_type_index) {
    					if_block = if_blocks[current_block_type_index];

    					if (!if_block) {
    						if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    						if_block.c();
    					} else {
    						if_block.p(ctx, dirty);
    					}

    					transition_in(if_block, 1);
    					if_block.m(li, t);
    				} else {
    					if_block = null;
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);

    			add_render_callback(() => {
    				if (li_outro) li_outro.end(1);
    				li_intro = create_in_transition(li, fly, { y: 200, duration: 750 });
    				li_intro.start();
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			if (li_intro) li_intro.invalidate();
    			li_outro = create_out_transition(li, fade, {});
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(li);

    			if (~current_block_type_index) {
    				if_blocks[current_block_type_index].d();
    			}

    			if (detaching && li_outro) li_outro.end();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_5.name,
    		type: "if",
    		source: "(118:12) {#if userChoiceIdx <= currentUserChoiceIdx}",
    		ctx
    	});

    	return block;
    }

    // (122:72) 
    function create_if_block_7(ctx) {
    	let button;
    	let current;

    	button = new Button_1({
    			props: {
    				disabled: true,
    				$$slots: { default: [create_default_slot_8$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(button.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(button, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const button_changes = {};

    			if (dirty & /*$$scope, userChoices*/ 16777218) {
    				button_changes.$$scope = { dirty, ctx };
    			}

    			button.$set(button_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(button.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(button.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(button, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_7.name,
    		type: "if",
    		source: "(122:72) ",
    		ctx
    	});

    	return block;
    }

    // (120:24) {#if userChoiceIdx < currentUserChoiceIdx}
    function create_if_block_6(ctx) {
    	let button;
    	let current;

    	function click_handler() {
    		return /*click_handler*/ ctx[11](/*userChoiceIdx*/ ctx[23]);
    	}

    	button = new Button_1({
    			props: {
    				$$slots: { default: [create_default_slot_7$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	button.$on("click", click_handler);

    	const block = {
    		c: function create() {
    			create_component(button.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(button, target, anchor);
    			current = true;
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			const button_changes = {};

    			if (dirty & /*$$scope, userChoices*/ 16777218) {
    				button_changes.$$scope = { dirty, ctx };
    			}

    			button.$set(button_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(button.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(button.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(button, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_6.name,
    		type: "if",
    		source: "(120:24) {#if userChoiceIdx < currentUserChoiceIdx}",
    		ctx
    	});

    	return block;
    }

    // (123:28) <Button disabled>
    function create_default_slot_8$1(ctx) {
    	let t_value = (/*userChoice*/ ctx[21].selectedChoiceKey
    	? /*userChoice*/ ctx[21].selectedChoiceKey
    	: /*userChoice*/ ctx[21].stepKey) + "";

    	let t;

    	const block = {
    		c: function create() {
    			t = text(t_value);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*userChoices*/ 2 && t_value !== (t_value = (/*userChoice*/ ctx[21].selectedChoiceKey
    			? /*userChoice*/ ctx[21].selectedChoiceKey
    			: /*userChoice*/ ctx[21].stepKey) + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_8$1.name,
    		type: "slot",
    		source: "(123:28) <Button disabled>",
    		ctx
    	});

    	return block;
    }

    // (121:28) <Button on:click={() => handleClickBreadcrumb(userChoiceIdx)}>
    function create_default_slot_7$1(ctx) {
    	let t_value = /*userChoice*/ ctx[21].selectedChoiceKey + "";
    	let t;

    	const block = {
    		c: function create() {
    			t = text(t_value);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*userChoices*/ 2 && t_value !== (t_value = /*userChoice*/ ctx[21].selectedChoiceKey + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_7$1.name,
    		type: "slot",
    		source: "(121:28) <Button on:click={() => handleClickBreadcrumb(userChoiceIdx)}>",
    		ctx
    	});

    	return block;
    }

    // (117:8) {#each userChoices as userChoice,userChoiceIdx}
    function create_each_block$1(ctx) {
    	let if_block_anchor;
    	let current;
    	let if_block = /*userChoiceIdx*/ ctx[23] <= /*currentUserChoiceIdx*/ ctx[0] && create_if_block_5(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (/*userChoiceIdx*/ ctx[23] <= /*currentUserChoiceIdx*/ ctx[0]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*currentUserChoiceIdx*/ 1) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block_5(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(117:8) {#each userChoices as userChoice,userChoiceIdx}",
    		ctx
    	});

    	return block;
    }

    // (130:4) {#if visibleCard }
    function create_if_block_1$1(ctx) {
    	let div;
    	let card;
    	let div_intro;
    	let div_outro;
    	let current;

    	card = new Card({
    			props: {
    				padded: true,
    				$$slots: { default: [create_default_slot$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(card.$$.fragment);
    			attr_dev(div, "class", "card-container");
    			add_location(div, file$1, 130, 8, 4796);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(card, div, null);
    			current = true;
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			const card_changes = {};

    			if (dirty & /*$$scope, currentGuideStep, selected, currentUserChoice*/ 16777244) {
    				card_changes.$$scope = { dirty, ctx };
    			}

    			card.$set(card_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(card.$$.fragment, local);

    			add_render_callback(() => {
    				if (div_outro) div_outro.end(1);

    				div_intro = create_in_transition(div, fly, {
    					x: 200 * /*transitionMultiplier*/ ctx[6],
    					duration: 750
    				});

    				div_intro.start();
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(card.$$.fragment, local);
    			if (div_intro) div_intro.invalidate();
    			div_outro = create_out_transition(div, fade, {});
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(card);
    			if (detaching && div_outro) div_outro.end();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$1.name,
    		type: "if",
    		source: "(130:4) {#if visibleCard }",
    		ctx
    	});

    	return block;
    }

    // (141:28) {:else}
    function create_else_block(ctx) {
    	let div;

    	let t_value = (/*currentGuideStep*/ ctx[3].question
    	? /*currentGuideStep*/ ctx[3].question
    	: /*currentGuideStep*/ ctx[3]) + "";

    	let t;

    	const block = {
    		c: function create() {
    			div = element("div");
    			t = text(t_value);
    			attr_dev(div, "class", "guide-prompt svelte-190ooxt");
    			add_location(div, file$1, 141, 32, 5711);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*currentGuideStep*/ 8 && t_value !== (t_value = (/*currentGuideStep*/ ctx[3].question
    			? /*currentGuideStep*/ ctx[3].question
    			: /*currentGuideStep*/ ctx[3]) + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(141:28) {:else}",
    		ctx
    	});

    	return block;
    }

    // (139:28) {#if (typeof currentGuideStep == 'string' || currentGuideStep instanceof String) && isValidHttpUrl(currentGuideStep)}
    function create_if_block_4(ctx) {
    	let a;
    	let t;

    	const block = {
    		c: function create() {
    			a = element("a");
    			t = text(/*currentGuideStep*/ ctx[3]);
    			attr_dev(a, "href", /*currentGuideStep*/ ctx[3]);
    			attr_dev(a, "target", "_tab");
    			add_location(a, file$1, 139, 32, 5577);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);
    			append_dev(a, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*currentGuideStep*/ 8) set_data_dev(t, /*currentGuideStep*/ ctx[3]);

    			if (dirty & /*currentGuideStep*/ 8) {
    				attr_dev(a, "href", /*currentGuideStep*/ ctx[3]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(a);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_4.name,
    		type: "if",
    		source: "(139:28) {#if (typeof currentGuideStep == 'string' || currentGuideStep instanceof String) && isValidHttpUrl(currentGuideStep)}",
    		ctx
    	});

    	return block;
    }

    // (147:32) {#if currentGuideStep.choices}
    function create_if_block_3(ctx) {
    	let div1;
    	let div0;
    	let segmentedbutton;
    	let updating_selected;
    	let current;

    	function segmentedbutton_selected_binding(value) {
    		/*segmentedbutton_selected_binding*/ ctx[13](value);
    	}

    	let segmentedbutton_props = {
    		segments: Object.keys(/*currentGuideStep*/ ctx[3].choices),
    		singleSelect: true,
    		$$slots: {
    			default: [
    				create_default_slot_4$1,
    				({ segment }) => ({ 20: segment }),
    				({ segment }) => segment ? 1048576 : 0
    			]
    		},
    		$$scope: { ctx }
    	};

    	if (/*selected*/ ctx[4] !== void 0) {
    		segmentedbutton_props.selected = /*selected*/ ctx[4];
    	}

    	segmentedbutton = new SegmentedButton({
    			props: segmentedbutton_props,
    			$$inline: true
    		});

    	binding_callbacks.push(() => bind(segmentedbutton, 'selected', segmentedbutton_selected_binding));

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			create_component(segmentedbutton.$$.fragment);
    			add_location(div0, file$1, 148, 40, 6143);
    			attr_dev(div1, "class", "segmented-button-group");
    			add_location(div1, file$1, 147, 36, 6065);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);
    			mount_component(segmentedbutton, div0, null);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const segmentedbutton_changes = {};
    			if (dirty & /*currentGuideStep*/ 8) segmentedbutton_changes.segments = Object.keys(/*currentGuideStep*/ ctx[3].choices);

    			if (dirty & /*$$scope, segment, currentUserChoice*/ 17825796) {
    				segmentedbutton_changes.$$scope = { dirty, ctx };
    			}

    			if (!updating_selected && dirty & /*selected*/ 16) {
    				updating_selected = true;
    				segmentedbutton_changes.selected = /*selected*/ ctx[4];
    				add_flush_callback(() => updating_selected = false);
    			}

    			segmentedbutton.$set(segmentedbutton_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(segmentedbutton.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(segmentedbutton.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			destroy_component(segmentedbutton);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3.name,
    		type: "if",
    		source: "(147:32) {#if currentGuideStep.choices}",
    		ctx
    	});

    	return block;
    }

    // (157:48) <Label>
    function create_default_slot_6$1(ctx) {
    	let t_value = /*segment*/ ctx[20] + "";
    	let t;

    	const block = {
    		c: function create() {
    			t = text(t_value);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*segment*/ 1048576 && t_value !== (t_value = /*segment*/ ctx[20] + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_6$1.name,
    		type: "slot",
    		source: "(157:48) <Label>",
    		ctx
    	});

    	return block;
    }

    // (154:44) <Segment {segment}                                                  on:click={() => handleClickChoice(currentUserChoice, segment)}                                                   style="flex: 1;">
    function create_default_slot_5$1(ctx) {
    	let label;
    	let current;

    	label = new Label({
    			props: {
    				$$slots: { default: [create_default_slot_6$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(label.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(label, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const label_changes = {};

    			if (dirty & /*$$scope, segment*/ 17825792) {
    				label_changes.$$scope = { dirty, ctx };
    			}

    			label.$set(label_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(label.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(label.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(label, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_5$1.name,
    		type: "slot",
    		source: "(154:44) <Segment {segment}                                                  on:click={() => handleClickChoice(currentUserChoice, segment)}                                                   style=\\\"flex: 1;\\\">",
    		ctx
    	});

    	return block;
    }

    // (150:40) <SegmentedButton                                              segments={Object.keys(currentGuideStep.choices)}                                               let:segment singleSelect                                               bind:selected>
    function create_default_slot_4$1(ctx) {
    	let segment;
    	let current;

    	function click_handler_1() {
    		return /*click_handler_1*/ ctx[12](/*segment*/ ctx[20]);
    	}

    	segment = new Segment({
    			props: {
    				segment: /*segment*/ ctx[20],
    				style: "flex: 1;",
    				$$slots: { default: [create_default_slot_5$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	segment.$on("click", click_handler_1);

    	const block = {
    		c: function create() {
    			create_component(segment.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(segment, target, anchor);
    			current = true;
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			const segment_changes = {};
    			if (dirty & /*segment*/ 1048576) segment_changes.segment = /*segment*/ ctx[20];

    			if (dirty & /*$$scope, segment*/ 17825792) {
    				segment_changes.$$scope = { dirty, ctx };
    			}

    			segment.$set(segment_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(segment.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(segment.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(segment, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_4$1.name,
    		type: "slot",
    		source: "(150:40) <SegmentedButton                                              segments={Object.keys(currentGuideStep.choices)}                                               let:segment singleSelect                                               bind:selected>",
    		ctx
    	});

    	return block;
    }

    // (146:28) <Actions>
    function create_default_slot_3$1(ctx) {
    	let if_block_anchor;
    	let current;
    	let if_block = /*currentGuideStep*/ ctx[3].choices && create_if_block_3(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (/*currentGuideStep*/ ctx[3].choices) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*currentGuideStep*/ 8) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block_3(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_3$1.name,
    		type: "slot",
    		source: "(146:28) <Actions>",
    		ctx
    	});

    	return block;
    }

    // (166:20) {#if currentGuideStep.learnMore}
    function create_if_block_2$1(ctx) {
    	let div;
    	let button;
    	let current;

    	button = new Button_1({
    			props: {
    				text: true,
    				class: "primary-text",
    				$$slots: { default: [create_default_slot_2$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	button.$on("click", /*click_handler_2*/ ctx[14]);

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(button.$$.fragment);
    			attr_dev(div, "class", "learn-more svelte-190ooxt");
    			add_location(div, file$1, 166, 24, 7245);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(button, div, null);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const button_changes = {};

    			if (dirty & /*$$scope*/ 16777216) {
    				button_changes.$$scope = { dirty, ctx };
    			}

    			button.$set(button_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(button.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(button.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(button);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2$1.name,
    		type: "if",
    		source: "(166:20) {#if currentGuideStep.learnMore}",
    		ctx
    	});

    	return block;
    }

    // (168:28) <Button text class="primary-text" on:click={() => {window.open(currentGuideStep.learnMore, "_tab")}}>
    function create_default_slot_2$1(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Learn More");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_2$1.name,
    		type: "slot",
    		source: "(168:28) <Button text class=\\\"primary-text\\\" on:click={() => {window.open(currentGuideStep.learnMore, \\\"_tab\\\")}}>",
    		ctx
    	});

    	return block;
    }

    // (133:16) <Content>
    function create_default_slot_1$1(ctx) {
    	let div3;
    	let div1;
    	let div0;
    	let t1;
    	let div2;
    	let show_if;
    	let t2;
    	let actions;
    	let t3;
    	let if_block1_anchor;
    	let current;

    	function select_block_type_1(ctx, dirty) {
    		if (dirty & /*currentGuideStep*/ 8) show_if = null;
    		if (show_if == null) show_if = !!((typeof /*currentGuideStep*/ ctx[3] == 'string' || /*currentGuideStep*/ ctx[3] instanceof String) && isValidHttpUrl(/*currentGuideStep*/ ctx[3]));
    		if (show_if) return create_if_block_4;
    		return create_else_block;
    	}

    	let current_block_type = select_block_type_1(ctx, -1);
    	let if_block0 = current_block_type(ctx);

    	actions = new Actions({
    			props: {
    				$$slots: { default: [create_default_slot_3$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	let if_block1 = /*currentGuideStep*/ ctx[3].learnMore && create_if_block_2$1(ctx);

    	const block = {
    		c: function create() {
    			div3 = element("div");
    			div1 = element("div");
    			div0 = element("div");
    			div0.textContent = "Guide:";
    			t1 = space();
    			div2 = element("div");
    			if_block0.c();
    			t2 = space();
    			create_component(actions.$$.fragment);
    			t3 = space();
    			if (if_block1) if_block1.c();
    			if_block1_anchor = empty();
    			attr_dev(div0, "class", "mdc-typography--body1");
    			add_location(div0, file$1, 135, 28, 5156);
    			set_style(div1, "margin", "0px");
    			set_style(div1, "padding", "10px 0px");
    			set_style(div1, "color", "#888");
    			set_style(div1, "width", "50px");
    			add_location(div1, file$1, 134, 24, 5056);
    			set_style(div2, "flex-grow", "1");
    			set_style(div2, "font-size", "24px");
    			set_style(div2, "background-color", "#F3F5F6");
    			set_style(div2, "margin", "10px");
    			set_style(div2, "padding", "25px 20px");
    			attr_dev(div2, "class", "mdc-typography--body1");
    			add_location(div2, file$1, 137, 24, 5261);
    			attr_dev(div3, "class", "container");
    			set_style(div3, "display", "flex");
    			set_style(div3, "flex-wrap", "wrap");
    			add_location(div3, file$1, 133, 20, 4967);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div3, anchor);
    			append_dev(div3, div1);
    			append_dev(div1, div0);
    			append_dev(div3, t1);
    			append_dev(div3, div2);
    			if_block0.m(div2, null);
    			append_dev(div2, t2);
    			mount_component(actions, div2, null);
    			insert_dev(target, t3, anchor);
    			if (if_block1) if_block1.m(target, anchor);
    			insert_dev(target, if_block1_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (current_block_type === (current_block_type = select_block_type_1(ctx, dirty)) && if_block0) {
    				if_block0.p(ctx, dirty);
    			} else {
    				if_block0.d(1);
    				if_block0 = current_block_type(ctx);

    				if (if_block0) {
    					if_block0.c();
    					if_block0.m(div2, t2);
    				}
    			}

    			const actions_changes = {};

    			if (dirty & /*$$scope, currentGuideStep, selected, currentUserChoice*/ 16777244) {
    				actions_changes.$$scope = { dirty, ctx };
    			}

    			actions.$set(actions_changes);

    			if (/*currentGuideStep*/ ctx[3].learnMore) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);

    					if (dirty & /*currentGuideStep*/ 8) {
    						transition_in(if_block1, 1);
    					}
    				} else {
    					if_block1 = create_if_block_2$1(ctx);
    					if_block1.c();
    					transition_in(if_block1, 1);
    					if_block1.m(if_block1_anchor.parentNode, if_block1_anchor);
    				}
    			} else if (if_block1) {
    				group_outros();

    				transition_out(if_block1, 1, 1, () => {
    					if_block1 = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(actions.$$.fragment, local);
    			transition_in(if_block1);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(actions.$$.fragment, local);
    			transition_out(if_block1);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div3);
    			if_block0.d();
    			destroy_component(actions);
    			if (detaching) detach_dev(t3);
    			if (if_block1) if_block1.d(detaching);
    			if (detaching) detach_dev(if_block1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_1$1.name,
    		type: "slot",
    		source: "(133:16) <Content>",
    		ctx
    	});

    	return block;
    }

    // (132:12) <Card padded>
    function create_default_slot$1(ctx) {
    	let content;
    	let current;

    	content = new Content({
    			props: {
    				$$slots: { default: [create_default_slot_1$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(content.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(content, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const content_changes = {};

    			if (dirty & /*$$scope, currentGuideStep, selected, currentUserChoice*/ 16777244) {
    				content_changes.$$scope = { dirty, ctx };
    			}

    			content.$set(content_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(content.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(content.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(content, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$1.name,
    		type: "slot",
    		source: "(132:12) <Card padded>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$1(ctx) {
    	let link0;
    	let link1;
    	let link2;
    	let t0;
    	let t1;
    	let if_block_anchor;
    	let current;
    	let if_block = /*currentGuideStep*/ ctx[3] && create_if_block$1(ctx);

    	const block = {
    		c: function create() {
    			link0 = element("link");
    			link1 = element("link");
    			link2 = element("link");
    			t0 = text("\r\n    />");
    			t1 = space();
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    			attr_dev(link0, "rel", "stylesheet");
    			attr_dev(link0, "href", "https://unpkg.com/@material/typography@13.0.0/dist/mdc.typography.css");
    			add_location(link0, file$1, 2, 1, 48);
    			attr_dev(link1, "rel", "stylesheet");
    			attr_dev(link1, "href", "https://unpkg.com/svelte-material-ui/bare.css");
    			add_location(link1, file$1, 5, 1, 172);
    			attr_dev(link2, "rel", "stylesheet");
    			attr_dev(link2, "href", "./smui.css");
    			attr_dev(link2, "media", "(prefers-color-scheme: light)");
    			add_location(link2, file$1, 8, 4, 284);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			append_dev(document.head, link0);
    			append_dev(document.head, link1);
    			append_dev(document.head, link2);
    			append_dev(document.head, t0);
    			insert_dev(target, t1, anchor);
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*currentGuideStep*/ ctx[3]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*currentGuideStep*/ 8) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block$1(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			detach_dev(link0);
    			detach_dev(link1);
    			detach_dev(link2);
    			detach_dev(t0);
    			if (detaching) detach_dev(t1);
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function getStepUrl(stepData) {
    	if (isValidHttpUrl(stepData)) {
    		return stepData;
    	}

    	if (stepData.selectedChoiceKey) {
    		let selectedChoiceValue = Object.values(stepData.selectedChoiceKey)[0];
    		if (isValidHttpUrl(selectedChoiceValue)) return selectedChoiceValue;
    	}

    	return undefined;
    }

    function isValidHttpUrl(possibleUrlStr) {
    	let url;

    	try {
    		url = new URL(possibleUrlStr);
    	} catch(_) {
    		return false;
    	}

    	return url.protocol === "http:" || url.protocol === "https:";
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Guide', slots, []);
    	let { guideData } = $$props;
    	let { startingStepKey } = $$props;

    	let startingUserChoice = new UserChoice({
    			path: `/${startingStepKey}`,
    			stepKey: startingStepKey
    		});

    	let currentUserChoiceIdx = 0;
    	let userChoices = [startingUserChoice];
    	let currentUserChoice;
    	let currentGuideStep;
    	let selected;
    	let htmlContent = '';
    	let visibleCard = true;
    	let transitionMultiplier = 1;
    	let disabled = false;

    	const handleClickChoice = (userChoice, choiceKey) => {
    		if (!disabled) {
    			disabled = true;
    			$$invalidate(4, selected = choiceKey);

    			if (choiceKey !== userChoice.selectedChoiceKey) {
    				$$invalidate(1, userChoices.length = currentUserChoiceIdx + 1, userChoices);
    				userChoice.selectedChoiceKey = choiceKey;
    				userChoice.selectedChoiceValue = guideData[userChoice.stepKey].choices[choiceKey];

    				if (currentUserChoiceIdx + 1 >= userChoices.length) {
    					let newUserChoice;

    					if (guideData.hasOwnProperty(userChoice.selectedChoiceValue)) {
    						newUserChoice = new UserChoice({
    								path: `${currentUserChoice.path}/${userChoice.selectedChoiceValue}`,
    								stepKey: userChoice.selectedChoiceValue
    							});
    					} else {
    						newUserChoice = new UserChoice({ url: userChoice.selectedChoiceValue });
    					}

    					$$invalidate(1, userChoices = [...userChoices, newUserChoice]);
    				} else {
    					$$invalidate(1, userChoices);
    				}
    			}

    			transitionCard(false, () => {
    				$$invalidate(0, currentUserChoiceIdx++, currentUserChoiceIdx);
    				disabled = false;
    			});
    		}
    	};

    	function transitionCard(toRight, callback) {
    		$$invalidate(6, transitionMultiplier = toRight ? -1 : 1);
    		$$invalidate(5, visibleCard = false);

    		setTimeout(
    			() => {
    				callback();
    				$$invalidate(5, visibleCard = true);
    			},
    			500
    		);
    	}

    	const handleClickBreadcrumb = userChoiceIdx => {
    		transitionCard(true, () => {
    			$$invalidate(0, currentUserChoiceIdx = userChoiceIdx);
    			$$invalidate(4, selected = userChoices[currentUserChoiceIdx].selectedChoiceKey);
    		});
    	};

    	function getHtml(url) {
    		if (url) {
    			fetch(url).then(response => {
    				return response.text();
    			}).then(html => {
    				htmlContent = html;
    			});
    		}
    	}

    	const writable_props = ['guideData', 'startingStepKey'];

    	Object_1$1.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Guide> was created with unknown prop '${key}'`);
    	});

    	const click_handler = userChoiceIdx => handleClickBreadcrumb(userChoiceIdx);
    	const click_handler_1 = segment => handleClickChoice(currentUserChoice, segment);

    	function segmentedbutton_selected_binding(value) {
    		selected = value;
    		$$invalidate(4, selected);
    	}

    	const click_handler_2 = () => {
    		window.open(currentGuideStep.learnMore, "_tab");
    	};

    	$$self.$$set = $$props => {
    		if ('guideData' in $$props) $$invalidate(9, guideData = $$props.guideData);
    		if ('startingStepKey' in $$props) $$invalidate(10, startingStepKey = $$props.startingStepKey);
    	};

    	$$self.$capture_state = () => ({
    		fade,
    		fly,
    		Card,
    		Content,
    		Actions,
    		Button: Button_1,
    		UserChoice,
    		SegmentedButton,
    		Segment,
    		Label,
    		guideData,
    		startingStepKey,
    		startingUserChoice,
    		currentUserChoiceIdx,
    		userChoices,
    		currentUserChoice,
    		currentGuideStep,
    		selected,
    		htmlContent,
    		visibleCard,
    		transitionMultiplier,
    		disabled,
    		handleClickChoice,
    		transitionCard,
    		handleClickBreadcrumb,
    		getHtml,
    		getStepUrl,
    		isValidHttpUrl
    	});

    	$$self.$inject_state = $$props => {
    		if ('guideData' in $$props) $$invalidate(9, guideData = $$props.guideData);
    		if ('startingStepKey' in $$props) $$invalidate(10, startingStepKey = $$props.startingStepKey);
    		if ('startingUserChoice' in $$props) startingUserChoice = $$props.startingUserChoice;
    		if ('currentUserChoiceIdx' in $$props) $$invalidate(0, currentUserChoiceIdx = $$props.currentUserChoiceIdx);
    		if ('userChoices' in $$props) $$invalidate(1, userChoices = $$props.userChoices);
    		if ('currentUserChoice' in $$props) $$invalidate(2, currentUserChoice = $$props.currentUserChoice);
    		if ('currentGuideStep' in $$props) $$invalidate(3, currentGuideStep = $$props.currentGuideStep);
    		if ('selected' in $$props) $$invalidate(4, selected = $$props.selected);
    		if ('htmlContent' in $$props) htmlContent = $$props.htmlContent;
    		if ('visibleCard' in $$props) $$invalidate(5, visibleCard = $$props.visibleCard);
    		if ('transitionMultiplier' in $$props) $$invalidate(6, transitionMultiplier = $$props.transitionMultiplier);
    		if ('disabled' in $$props) disabled = $$props.disabled;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*userChoices, currentUserChoiceIdx*/ 3) {
    			$$invalidate(2, currentUserChoice = userChoices[currentUserChoiceIdx]);
    		}

    		if ($$self.$$.dirty & /*currentUserChoice, guideData*/ 516) {
    			$$invalidate(3, currentGuideStep = currentUserChoice && currentUserChoice.stepKey
    			? guideData[currentUserChoice.stepKey]
    			: undefined);
    		}
    	};

    	return [
    		currentUserChoiceIdx,
    		userChoices,
    		currentUserChoice,
    		currentGuideStep,
    		selected,
    		visibleCard,
    		transitionMultiplier,
    		handleClickChoice,
    		handleClickBreadcrumb,
    		guideData,
    		startingStepKey,
    		click_handler,
    		click_handler_1,
    		segmentedbutton_selected_binding,
    		click_handler_2
    	];
    }

    class Guide extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, { guideData: 9, startingStepKey: 10 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Guide",
    			options,
    			id: create_fragment$1.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*guideData*/ ctx[9] === undefined && !('guideData' in props)) {
    			console.warn("<Guide> was created without expected prop 'guideData'");
    		}

    		if (/*startingStepKey*/ ctx[10] === undefined && !('startingStepKey' in props)) {
    			console.warn("<Guide> was created without expected prop 'startingStepKey'");
    		}
    	}

    	get guideData() {
    		throw new Error("<Guide>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set guideData(value) {
    		throw new Error("<Guide>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get startingStepKey() {
    		throw new Error("<Guide>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set startingStepKey(value) {
    		throw new Error("<Guide>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    // generated by genversion
    const version = '1.2.3';

    /* src\App.svelte generated by Svelte v3.46.4 */

    const { Object: Object_1, console: console_1 } = globals;
    const file = "src\\App.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[14] = list[i];
    	child_ctx[16] = i;
    	return child_ctx;
    }

    // (64:5) <IconButton        class="material-icons"        on:click={() => menu.setOpen(true)}>
    function create_default_slot_13(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("menu");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_13.name,
    		type: "slot",
    		source: "(64:5) <IconButton        class=\\\"material-icons\\\"        on:click={() => menu.setOpen(true)}>",
    		ctx
    	});

    	return block;
    }

    // (70:7) {#if $guideData}
    function create_if_block_2(ctx) {
    	let each_1_anchor;
    	let current;
    	let each_value = /*$guideData*/ ctx[4];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each_1_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*useGuide, $guideData*/ 528) {
    				each_value = /*$guideData*/ ctx[4];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2.name,
    		type: "if",
    		source: "(70:7) {#if $guideData}",
    		ctx
    	});

    	return block;
    }

    // (76:10) <Text>
    function create_default_slot_12(ctx) {
    	let t_value = /*guideInList*/ ctx[14].title + "";
    	let t;

    	const block = {
    		c: function create() {
    			t = text(t_value);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*$guideData*/ 16 && t_value !== (t_value = /*guideInList*/ ctx[14].title + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_12.name,
    		type: "slot",
    		source: "(76:10) <Text>",
    		ctx
    	});

    	return block;
    }

    // (72:9) <Item            on:SMUI:action={() =>             useGuide(guideInList.title)}           >
    function create_default_slot_11(ctx) {
    	let text_1;
    	let t;
    	let current;

    	text_1 = new Text({
    			props: {
    				$$slots: { default: [create_default_slot_12] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(text_1.$$.fragment);
    			t = space();
    		},
    		m: function mount(target, anchor) {
    			mount_component(text_1, target, anchor);
    			insert_dev(target, t, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const text_1_changes = {};

    			if (dirty & /*$$scope, $guideData*/ 131088) {
    				text_1_changes.$$scope = { dirty, ctx };
    			}

    			text_1.$set(text_1_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(text_1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(text_1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(text_1, detaching);
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_11.name,
    		type: "slot",
    		source: "(72:9) <Item            on:SMUI:action={() =>             useGuide(guideInList.title)}           >",
    		ctx
    	});

    	return block;
    }

    // (71:8) {#each $guideData as guideInList, i}
    function create_each_block(ctx) {
    	let item;
    	let current;

    	function SMUI_action_handler() {
    		return /*SMUI_action_handler*/ ctx[11](/*guideInList*/ ctx[14]);
    	}

    	item = new Item({
    			props: {
    				$$slots: { default: [create_default_slot_11] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	item.$on("SMUI:action", SMUI_action_handler);

    	const block = {
    		c: function create() {
    			create_component(item.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(item, target, anchor);
    			current = true;
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			const item_changes = {};

    			if (dirty & /*$$scope, $guideData*/ 131088) {
    				item_changes.$$scope = { dirty, ctx };
    			}

    			item.$set(item_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(item.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(item.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(item, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(71:8) {#each $guideData as guideInList, i}",
    		ctx
    	});

    	return block;
    }

    // (69:6) <List>
    function create_default_slot_10(ctx) {
    	let if_block_anchor;
    	let current;
    	let if_block = /*$guideData*/ ctx[4] && create_if_block_2(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (/*$guideData*/ ctx[4]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*$guideData*/ 16) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block_2(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_10.name,
    		type: "slot",
    		source: "(69:6) <List>",
    		ctx
    	});

    	return block;
    }

    // (68:5) <Menu bind:this={menu}>
    function create_default_slot_9(ctx) {
    	let list;
    	let current;

    	list = new List({
    			props: {
    				$$slots: { default: [create_default_slot_10] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(list.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(list, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const list_changes = {};

    			if (dirty & /*$$scope, $guideData*/ 131088) {
    				list_changes.$$scope = { dirty, ctx };
    			}

    			list.$set(list_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(list.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(list.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(list, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_9.name,
    		type: "slot",
    		source: "(68:5) <Menu bind:this={menu}>",
    		ctx
    	});

    	return block;
    }

    // (83:5) <Title        >
    function create_default_slot_8(ctx) {
    	let t0;
    	let t1;
    	let span;
    	let t4;

    	let t5_value = (/*$guideData*/ ctx[4]
    	? /*$guideData*/ ctx[4][/*currentGuideIdx*/ ctx[1]].title
    	: "Loading...") + "";

    	let t5;

    	const block = {
    		c: function create() {
    			t0 = text(/*title*/ ctx[5]);
    			t1 = space();
    			span = element("span");
    			span.textContent = `v${version}`;
    			t4 = text(": ");
    			t5 = text(t5_value);
    			set_style(span, "font-size", "80%");
    			add_location(span, file, 83, 15, 2573);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t0, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, span, anchor);
    			insert_dev(target, t4, anchor);
    			insert_dev(target, t5, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*$guideData, currentGuideIdx*/ 18 && t5_value !== (t5_value = (/*$guideData*/ ctx[4]
    			? /*$guideData*/ ctx[4][/*currentGuideIdx*/ ctx[1]].title
    			: "Loading...") + "")) set_data_dev(t5, t5_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(span);
    			if (detaching) detach_dev(t4);
    			if (detaching) detach_dev(t5);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_8.name,
    		type: "slot",
    		source: "(83:5) <Title        >",
    		ctx
    	});

    	return block;
    }

    // (63:4) <Section>
    function create_default_slot_7(ctx) {
    	let iconbutton;
    	let t0;
    	let menu_1;
    	let t1;
    	let title_1;
    	let current;

    	iconbutton = new IconButton({
    			props: {
    				class: "material-icons",
    				$$slots: { default: [create_default_slot_13] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	iconbutton.$on("click", /*click_handler*/ ctx[10]);

    	let menu_1_props = {
    		$$slots: { default: [create_default_slot_9] },
    		$$scope: { ctx }
    	};

    	menu_1 = new Menu({ props: menu_1_props, $$inline: true });
    	/*menu_1_binding*/ ctx[12](menu_1);

    	title_1 = new Title({
    			props: {
    				$$slots: { default: [create_default_slot_8] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(iconbutton.$$.fragment);
    			t0 = space();
    			create_component(menu_1.$$.fragment);
    			t1 = space();
    			create_component(title_1.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(iconbutton, target, anchor);
    			insert_dev(target, t0, anchor);
    			mount_component(menu_1, target, anchor);
    			insert_dev(target, t1, anchor);
    			mount_component(title_1, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const iconbutton_changes = {};

    			if (dirty & /*$$scope*/ 131072) {
    				iconbutton_changes.$$scope = { dirty, ctx };
    			}

    			iconbutton.$set(iconbutton_changes);
    			const menu_1_changes = {};

    			if (dirty & /*$$scope, $guideData*/ 131088) {
    				menu_1_changes.$$scope = { dirty, ctx };
    			}

    			menu_1.$set(menu_1_changes);
    			const title_1_changes = {};

    			if (dirty & /*$$scope, $guideData, currentGuideIdx*/ 131090) {
    				title_1_changes.$$scope = { dirty, ctx };
    			}

    			title_1.$set(title_1_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(iconbutton.$$.fragment, local);
    			transition_in(menu_1.$$.fragment, local);
    			transition_in(title_1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(iconbutton.$$.fragment, local);
    			transition_out(menu_1.$$.fragment, local);
    			transition_out(title_1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(iconbutton, detaching);
    			if (detaching) detach_dev(t0);
    			/*menu_1_binding*/ ctx[12](null);
    			destroy_component(menu_1, detaching);
    			if (detaching) detach_dev(t1);
    			destroy_component(title_1, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_7.name,
    		type: "slot",
    		source: "(63:4) <Section>",
    		ctx
    	});

    	return block;
    }

    // (88:5) <IconButton class="material-icons" aria-label="Download"        >
    function create_default_slot_6(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("file_download");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_6.name,
    		type: "slot",
    		source: "(88:5) <IconButton class=\\\"material-icons\\\" aria-label=\\\"Download\\\"        >",
    		ctx
    	});

    	return block;
    }

    // (91:5) <IconButton        class="material-icons"        aria-label="Print this page">
    function create_default_slot_5(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("print");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_5.name,
    		type: "slot",
    		source: "(91:5) <IconButton        class=\\\"material-icons\\\"        aria-label=\\\"Print this page\\\">",
    		ctx
    	});

    	return block;
    }

    // (95:5) <IconButton        class="material-icons"        aria-label="Bookmark this page">
    function create_default_slot_4(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("bookmark");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_4.name,
    		type: "slot",
    		source: "(95:5) <IconButton        class=\\\"material-icons\\\"        aria-label=\\\"Bookmark this page\\\">",
    		ctx
    	});

    	return block;
    }

    // (87:4) <Section align="end" toolbar>
    function create_default_slot_3(ctx) {
    	let iconbutton0;
    	let t0;
    	let iconbutton1;
    	let t1;
    	let iconbutton2;
    	let current;

    	iconbutton0 = new IconButton({
    			props: {
    				class: "material-icons",
    				"aria-label": "Download",
    				$$slots: { default: [create_default_slot_6] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	iconbutton1 = new IconButton({
    			props: {
    				class: "material-icons",
    				"aria-label": "Print this page",
    				$$slots: { default: [create_default_slot_5] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	iconbutton2 = new IconButton({
    			props: {
    				class: "material-icons",
    				"aria-label": "Bookmark this page",
    				$$slots: { default: [create_default_slot_4] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(iconbutton0.$$.fragment);
    			t0 = space();
    			create_component(iconbutton1.$$.fragment);
    			t1 = space();
    			create_component(iconbutton2.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(iconbutton0, target, anchor);
    			insert_dev(target, t0, anchor);
    			mount_component(iconbutton1, target, anchor);
    			insert_dev(target, t1, anchor);
    			mount_component(iconbutton2, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const iconbutton0_changes = {};

    			if (dirty & /*$$scope*/ 131072) {
    				iconbutton0_changes.$$scope = { dirty, ctx };
    			}

    			iconbutton0.$set(iconbutton0_changes);
    			const iconbutton1_changes = {};

    			if (dirty & /*$$scope*/ 131072) {
    				iconbutton1_changes.$$scope = { dirty, ctx };
    			}

    			iconbutton1.$set(iconbutton1_changes);
    			const iconbutton2_changes = {};

    			if (dirty & /*$$scope*/ 131072) {
    				iconbutton2_changes.$$scope = { dirty, ctx };
    			}

    			iconbutton2.$set(iconbutton2_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(iconbutton0.$$.fragment, local);
    			transition_in(iconbutton1.$$.fragment, local);
    			transition_in(iconbutton2.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(iconbutton0.$$.fragment, local);
    			transition_out(iconbutton1.$$.fragment, local);
    			transition_out(iconbutton2.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(iconbutton0, detaching);
    			if (detaching) detach_dev(t0);
    			destroy_component(iconbutton1, detaching);
    			if (detaching) detach_dev(t1);
    			destroy_component(iconbutton2, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_3.name,
    		type: "slot",
    		source: "(87:4) <Section align=\\\"end\\\" toolbar>",
    		ctx
    	});

    	return block;
    }

    // (62:3) <Row>
    function create_default_slot_2(ctx) {
    	let section0;
    	let t;
    	let section1;
    	let current;

    	section0 = new Section({
    			props: {
    				$$slots: { default: [create_default_slot_7] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	section1 = new Section({
    			props: {
    				align: "end",
    				toolbar: true,
    				$$slots: { default: [create_default_slot_3] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(section0.$$.fragment);
    			t = space();
    			create_component(section1.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(section0, target, anchor);
    			insert_dev(target, t, anchor);
    			mount_component(section1, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const section0_changes = {};

    			if (dirty & /*$$scope, $guideData, currentGuideIdx, menu*/ 131091) {
    				section0_changes.$$scope = { dirty, ctx };
    			}

    			section0.$set(section0_changes);
    			const section1_changes = {};

    			if (dirty & /*$$scope*/ 131072) {
    				section1_changes.$$scope = { dirty, ctx };
    			}

    			section1.$set(section1_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(section0.$$.fragment, local);
    			transition_in(section1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(section0.$$.fragment, local);
    			transition_out(section1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(section0, detaching);
    			if (detaching) detach_dev(t);
    			destroy_component(section1, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_2.name,
    		type: "slot",
    		source: "(62:3) <Row>",
    		ctx
    	});

    	return block;
    }

    // (56:2) <TopAppBar     variant="static"     {prominent}     {dense}     color={secondaryColor ? "secondary" : "primary"}    >
    function create_default_slot_1(ctx) {
    	let row;
    	let current;

    	row = new Row({
    			props: {
    				$$slots: { default: [create_default_slot_2] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(row.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(row, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const row_changes = {};

    			if (dirty & /*$$scope, $guideData, currentGuideIdx, menu*/ 131091) {
    				row_changes.$$scope = { dirty, ctx };
    			}

    			row.$set(row_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(row.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(row.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(row, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_1.name,
    		type: "slot",
    		source: "(56:2) <TopAppBar     variant=\\\"static\\\"     {prominent}     {dense}     color={secondaryColor ? \\\"secondary\\\" : \\\"primary\\\"}    >",
    		ctx
    	});

    	return block;
    }

    // (106:3) {#if !guideVisible}
    function create_if_block_1(ctx) {
    	let banner;
    	let current;

    	banner = new Banner({
    			props: {
    				open: true,
    				fixed: true,
    				mobileStacked: true,
    				content$style: "max-width: max-content;",
    				$$slots: { label: [create_label_slot] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(banner.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(banner, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(banner.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(banner.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(banner, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(106:3) {#if !guideVisible}",
    		ctx
    	});

    	return block;
    }

    // (113:5) <Label slot="label">
    function create_default_slot(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Loading...");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot.name,
    		type: "slot",
    		source: "(113:5) <Label slot=\\\"label\\\">",
    		ctx
    	});

    	return block;
    }

    // (113:5) 
    function create_label_slot(ctx) {
    	let label;
    	let current;

    	label = new Label({
    			props: {
    				slot: "label",
    				$$slots: { default: [create_default_slot] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(label.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(label, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const label_changes = {};

    			if (dirty & /*$$scope*/ 131072) {
    				label_changes.$$scope = { dirty, ctx };
    			}

    			label.$set(label_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(label.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(label.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(label, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_label_slot.name,
    		type: "slot",
    		source: "(113:5) ",
    		ctx
    	});

    	return block;
    }

    // (116:3) {#if $guideData && guideVisible}
    function create_if_block(ctx) {
    	let div;
    	let guide;
    	let div_intro;
    	let div_outro;
    	let current;

    	guide = new Guide({
    			props: {
    				guideData: /*$guideData*/ ctx[4][/*currentGuideIdx*/ ctx[1]],
    				startingStepKey: /*startingStepKey*/ ctx[2]
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(guide.$$.fragment);
    			add_location(div, file, 116, 4, 3636);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(guide, div, null);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const guide_changes = {};
    			if (dirty & /*$guideData, currentGuideIdx*/ 18) guide_changes.guideData = /*$guideData*/ ctx[4][/*currentGuideIdx*/ ctx[1]];
    			if (dirty & /*startingStepKey*/ 4) guide_changes.startingStepKey = /*startingStepKey*/ ctx[2];
    			guide.$set(guide_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(guide.$$.fragment, local);

    			add_render_callback(() => {
    				if (div_outro) div_outro.end(1);
    				div_intro = create_in_transition(div, fly, { y: 200, duration: 750 });
    				div_intro.start();
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(guide.$$.fragment, local);
    			if (div_intro) div_intro.invalidate();
    			div_outro = create_out_transition(div, fade, {});
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(guide);
    			if (detaching && div_outro) div_outro.end();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(116:3) {#if $guideData && guideVisible}",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let link0;
    	let link1;
    	let link2;
    	let t0;
    	let t1;
    	let div2;
    	let div1;
    	let topappbar;
    	let t2;
    	let div0;
    	let t3;
    	let current;

    	topappbar = new TopAppBar({
    			props: {
    				variant: "static",
    				prominent: /*prominent*/ ctx[6],
    				dense: /*dense*/ ctx[7],
    				color: /*secondaryColor*/ ctx[8] ? "secondary" : "primary",
    				$$slots: { default: [create_default_slot_1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	let if_block0 = !/*guideVisible*/ ctx[3] && create_if_block_1(ctx);
    	let if_block1 = /*$guideData*/ ctx[4] && /*guideVisible*/ ctx[3] && create_if_block(ctx);

    	const block = {
    		c: function create() {
    			link0 = element("link");
    			link1 = element("link");
    			link2 = element("link");
    			t0 = text("\r\n    />");
    			t1 = space();
    			div2 = element("div");
    			div1 = element("div");
    			create_component(topappbar.$$.fragment);
    			t2 = space();
    			div0 = element("div");
    			if (if_block0) if_block0.c();
    			t3 = space();
    			if (if_block1) if_block1.c();
    			attr_dev(link0, "rel", "stylesheet");
    			attr_dev(link0, "href", "https://unpkg.com/@material/typography@13.0.0/dist/mdc.typography.css");
    			add_location(link0, file, 2, 1, 48);
    			attr_dev(link1, "rel", "stylesheet");
    			attr_dev(link1, "href", "https://unpkg.com/svelte-material-ui/bare.css");
    			add_location(link1, file, 5, 1, 172);
    			attr_dev(link2, "rel", "stylesheet");
    			attr_dev(link2, "href", "./smui.css");
    			attr_dev(link2, "media", "(prefers-color-scheme: light)");
    			add_location(link2, file, 8, 4, 284);
    			attr_dev(div0, "class", "flexor-content svelte-ba2qn5");
    			add_location(div0, file, 101, 2, 3127);
    			attr_dev(div1, "class", "top-app-bar-container flexor svelte-ba2qn5");
    			add_location(div1, file, 54, 1, 1898);
    			attr_dev(div2, "class", "flexy svelte-ba2qn5");
    			add_location(div2, file, 53, 0, 1876);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			append_dev(document.head, link0);
    			append_dev(document.head, link1);
    			append_dev(document.head, link2);
    			append_dev(document.head, t0);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div1);
    			mount_component(topappbar, div1, null);
    			append_dev(div1, t2);
    			append_dev(div1, div0);
    			if (if_block0) if_block0.m(div0, null);
    			append_dev(div0, t3);
    			if (if_block1) if_block1.m(div0, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const topappbar_changes = {};

    			if (dirty & /*$$scope, $guideData, currentGuideIdx, menu*/ 131091) {
    				topappbar_changes.$$scope = { dirty, ctx };
    			}

    			topappbar.$set(topappbar_changes);

    			if (!/*guideVisible*/ ctx[3]) {
    				if (if_block0) {
    					if (dirty & /*guideVisible*/ 8) {
    						transition_in(if_block0, 1);
    					}
    				} else {
    					if_block0 = create_if_block_1(ctx);
    					if_block0.c();
    					transition_in(if_block0, 1);
    					if_block0.m(div0, t3);
    				}
    			} else if (if_block0) {
    				group_outros();

    				transition_out(if_block0, 1, 1, () => {
    					if_block0 = null;
    				});

    				check_outros();
    			}

    			if (/*$guideData*/ ctx[4] && /*guideVisible*/ ctx[3]) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);

    					if (dirty & /*$guideData, guideVisible*/ 24) {
    						transition_in(if_block1, 1);
    					}
    				} else {
    					if_block1 = create_if_block(ctx);
    					if_block1.c();
    					transition_in(if_block1, 1);
    					if_block1.m(div0, null);
    				}
    			} else if (if_block1) {
    				group_outros();

    				transition_out(if_block1, 1, 1, () => {
    					if_block1 = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(topappbar.$$.fragment, local);
    			transition_in(if_block0);
    			transition_in(if_block1);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(topappbar.$$.fragment, local);
    			transition_out(if_block0);
    			transition_out(if_block1);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			detach_dev(link0);
    			detach_dev(link1);
    			detach_dev(link2);
    			detach_dev(t0);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(div2);
    			destroy_component(topappbar);
    			if (if_block0) if_block0.d();
    			if (if_block1) if_block1.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let $guideData;
    	validate_store(guideData, 'guideData');
    	component_subscribe($$self, guideData, $$value => $$invalidate(4, $guideData = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('App', slots, []);
    	let title = "Guide-Me";
    	let menu;
    	let prominent = false;
    	let dense = false;
    	let secondaryColor = false;
    	let currentGuideIdx = 0;
    	let startingStepKey = "which";
    	let guideVisible = true;

    	function init(guideTitle) {
    		$$invalidate(1, currentGuideIdx = $guideData.findIndex(h => h.title === guideTitle));
    		$$invalidate(2, startingStepKey = Object.keys($guideData[currentGuideIdx]).find(k => k !== "title"));
    	}

    	const useGuide = guideTitle => {
    		$$invalidate(3, guideVisible = false);

    		setTimeout(
    			() => {
    				init(guideTitle); // FIXME a delay >=500ms is required here otherwise the guide never actually changes
    				$$invalidate(3, guideVisible = true);
    			},
    			500
    		); // FIXME a delay >=500ms is required here otherwise the guide never actually changes
    	};

    	onMount(async () => {
    		if ($guideData && currentGuideIdx && $guideData[currentGuideIdx]) {
    			console.log("$guideData=" + $guideData);
    			console.log("currentGuideIdx=" + currentGuideIdx);
    			console.log("$guideData[currentGuideIdx]=" + $guideData[currentGuideIdx]);
    			init($guideData[currentGuideIdx].title);
    		}
    	});

    	const writable_props = [];

    	Object_1.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => menu.setOpen(true);
    	const SMUI_action_handler = guideInList => useGuide(guideInList.title);

    	function menu_1_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			menu = $$value;
    			$$invalidate(0, menu);
    		});
    	}

    	$$self.$capture_state = () => ({
    		onMount,
    		guideData,
    		TopAppBar,
    		Row,
    		Section,
    		Title,
    		IconButton,
    		Banner,
    		Label,
    		Menu,
    		List,
    		Item,
    		Text,
    		Guide,
    		fade,
    		fly,
    		version,
    		title,
    		menu,
    		prominent,
    		dense,
    		secondaryColor,
    		currentGuideIdx,
    		startingStepKey,
    		guideVisible,
    		init,
    		useGuide,
    		$guideData
    	});

    	$$self.$inject_state = $$props => {
    		if ('title' in $$props) $$invalidate(5, title = $$props.title);
    		if ('menu' in $$props) $$invalidate(0, menu = $$props.menu);
    		if ('prominent' in $$props) $$invalidate(6, prominent = $$props.prominent);
    		if ('dense' in $$props) $$invalidate(7, dense = $$props.dense);
    		if ('secondaryColor' in $$props) $$invalidate(8, secondaryColor = $$props.secondaryColor);
    		if ('currentGuideIdx' in $$props) $$invalidate(1, currentGuideIdx = $$props.currentGuideIdx);
    		if ('startingStepKey' in $$props) $$invalidate(2, startingStepKey = $$props.startingStepKey);
    		if ('guideVisible' in $$props) $$invalidate(3, guideVisible = $$props.guideVisible);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		menu,
    		currentGuideIdx,
    		startingStepKey,
    		guideVisible,
    		$guideData,
    		title,
    		prominent,
    		dense,
    		secondaryColor,
    		useGuide,
    		click_handler,
    		SMUI_action_handler,
    		menu_1_binding
    	];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    const app = new App({
        target: document.body,
        props: {}
    });

    return app;

})();
//# sourceMappingURL=bundle.js.map
