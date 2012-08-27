/**
 * Add all properties of one object to another
 *
 * @param {Object} from
 * @return {Object}
 */
Object.defineProperty(Object.prototype, "extend", {
    enumerable : false,
    value      : function (from) {
        var dest  = this,
            props = Object.getOwnPropertyNames(from);

        props.forEach(function (name) {
            var description = Object.getOwnPropertyDescriptor(from, name);
            Object.defineProperty(dest, name, description);
        });

        return this;
    }
});