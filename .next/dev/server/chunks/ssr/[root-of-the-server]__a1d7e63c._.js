module.exports = [
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/action-async-storage.external.js [external] (next/dist/server/app-render/action-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/action-async-storage.external.js", () => require("next/dist/server/app-render/action-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-unit-async-storage.external.js [external] (next/dist/server/app-render/work-unit-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-unit-async-storage.external.js", () => require("next/dist/server/app-render/work-unit-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-async-storage.external.js [external] (next/dist/server/app-render/work-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-async-storage.external.js", () => require("next/dist/server/app-render/work-async-storage.external.js"));

module.exports = mod;
}),
"[project]/hooks/use-toast.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "reducer",
    ()=>reducer,
    "toast",
    ()=>toast,
    "useToast",
    ()=>useToast
]);
// Inspired by react-hot-toast library
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
'use client';
;
const TOAST_LIMIT = 1;
const TOAST_REMOVE_DELAY = 1000000;
const actionTypes = {
    ADD_TOAST: 'ADD_TOAST',
    UPDATE_TOAST: 'UPDATE_TOAST',
    DISMISS_TOAST: 'DISMISS_TOAST',
    REMOVE_TOAST: 'REMOVE_TOAST'
};
let count = 0;
function genId() {
    count = (count + 1) % Number.MAX_SAFE_INTEGER;
    return count.toString();
}
const toastTimeouts = new Map();
const addToRemoveQueue = (toastId)=>{
    if (toastTimeouts.has(toastId)) {
        return;
    }
    const timeout = setTimeout(()=>{
        toastTimeouts.delete(toastId);
        dispatch({
            type: 'REMOVE_TOAST',
            toastId: toastId
        });
    }, TOAST_REMOVE_DELAY);
    toastTimeouts.set(toastId, timeout);
};
const reducer = (state, action)=>{
    switch(action.type){
        case 'ADD_TOAST':
            return {
                ...state,
                toasts: [
                    action.toast,
                    ...state.toasts
                ].slice(0, TOAST_LIMIT)
            };
        case 'UPDATE_TOAST':
            return {
                ...state,
                toasts: state.toasts.map((t)=>t.id === action.toast.id ? {
                        ...t,
                        ...action.toast
                    } : t)
            };
        case 'DISMISS_TOAST':
            {
                const { toastId } = action;
                // ! Side effects ! - This could be extracted into a dismissToast() action,
                // but I'll keep it here for simplicity
                if (toastId) {
                    addToRemoveQueue(toastId);
                } else {
                    state.toasts.forEach((toast)=>{
                        addToRemoveQueue(toast.id);
                    });
                }
                return {
                    ...state,
                    toasts: state.toasts.map((t)=>t.id === toastId || toastId === undefined ? {
                            ...t,
                            open: false
                        } : t)
                };
            }
        case 'REMOVE_TOAST':
            if (action.toastId === undefined) {
                return {
                    ...state,
                    toasts: []
                };
            }
            return {
                ...state,
                toasts: state.toasts.filter((t)=>t.id !== action.toastId)
            };
    }
};
const listeners = [];
let memoryState = {
    toasts: []
};
function dispatch(action) {
    memoryState = reducer(memoryState, action);
    listeners.forEach((listener)=>{
        listener(memoryState);
    });
}
function toast({ ...props }) {
    const id = genId();
    const update = (props)=>dispatch({
            type: 'UPDATE_TOAST',
            toast: {
                ...props,
                id
            }
        });
    const dismiss = ()=>dispatch({
            type: 'DISMISS_TOAST',
            toastId: id
        });
    dispatch({
        type: 'ADD_TOAST',
        toast: {
            ...props,
            id,
            open: true,
            onOpenChange: (open)=>{
                if (!open) dismiss();
            }
        }
    });
    return {
        id: id,
        dismiss,
        update
    };
}
function useToast() {
    const [state, setState] = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"](memoryState);
    __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"](()=>{
        listeners.push(setState);
        return ()=>{
            const index = listeners.indexOf(setState);
            if (index > -1) {
                listeners.splice(index, 1);
            }
        };
    }, [
        state
    ]);
    return {
        ...state,
        toast,
        dismiss: (toastId)=>dispatch({
                type: 'DISMISS_TOAST',
                toastId
            })
    };
}
;
}),
"[project]/lib/utils.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "cn",
    ()=>cn
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$clsx$2f$dist$2f$clsx$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/clsx/dist/clsx.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$tailwind$2d$merge$2f$dist$2f$bundle$2d$mjs$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/tailwind-merge/dist/bundle-mjs.mjs [app-ssr] (ecmascript)");
;
;
function cn(...inputs) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$tailwind$2d$merge$2f$dist$2f$bundle$2d$mjs$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["twMerge"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$clsx$2f$dist$2f$clsx$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["clsx"])(inputs));
}
}),
"[project]/components/ui/toast.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Toast",
    ()=>Toast,
    "ToastAction",
    ()=>ToastAction,
    "ToastClose",
    ()=>ToastClose,
    "ToastDescription",
    ()=>ToastDescription,
    "ToastProvider",
    ()=>ToastProvider,
    "ToastTitle",
    ()=>ToastTitle,
    "ToastViewport",
    ()=>ToastViewport
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$toast$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@radix-ui/react-toast/dist/index.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$class$2d$variance$2d$authority$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/class-variance-authority/dist/index.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/x.js [app-ssr] (ecmascript) <export default as X>");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/utils.ts [app-ssr] (ecmascript)");
'use client';
;
;
;
;
;
;
const ToastProvider = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$toast$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Provider"];
const ToastViewport = /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["forwardRef"](({ className, ...props }, ref)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$toast$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Viewport"], {
        ref: ref,
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cn"])('fixed top-0 z-[100] flex max-h-screen w-full flex-col-reverse p-4 sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col md:max-w-[420px]', className),
        ...props
    }, void 0, false, {
        fileName: "[project]/components/ui/toast.tsx",
        lineNumber: 16,
        columnNumber: 3
    }, ("TURBOPACK compile-time value", void 0)));
ToastViewport.displayName = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$toast$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Viewport"].displayName;
const toastVariants = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$class$2d$variance$2d$authority$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cva"])('group pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-md border p-6 pr-8 shadow-lg transition-all data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)] data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=move]:transition-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[swipe=end]:animate-out data-[state=closed]:fade-out-80 data-[state=closed]:slide-out-to-right-full data-[state=open]:slide-in-from-top-full data-[state=open]:sm:slide-in-from-bottom-full', {
    variants: {
        variant: {
            default: 'border bg-background text-foreground',
            destructive: 'destructive group border-destructive bg-destructive text-destructive-foreground'
        }
    },
    defaultVariants: {
        variant: 'default'
    }
});
const Toast = /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["forwardRef"](({ className, variant, ...props }, ref)=>{
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$toast$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Root"], {
        ref: ref,
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cn"])(toastVariants({
            variant
        }), className),
        ...props
    }, void 0, false, {
        fileName: "[project]/components/ui/toast.tsx",
        lineNumber: 49,
        columnNumber: 5
    }, ("TURBOPACK compile-time value", void 0));
});
Toast.displayName = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$toast$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Root"].displayName;
const ToastAction = /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["forwardRef"](({ className, ...props }, ref)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$toast$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Action"], {
        ref: ref,
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cn"])('inline-flex h-8 shrink-0 items-center justify-center rounded-md border bg-transparent px-3 text-sm font-medium ring-offset-background transition-colors hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 group-[.destructive]:border-muted/40 group-[.destructive]:hover:border-destructive/30 group-[.destructive]:hover:bg-destructive group-[.destructive]:hover:text-destructive-foreground group-[.destructive]:focus:ring-destructive', className),
        ...props
    }, void 0, false, {
        fileName: "[project]/components/ui/toast.tsx",
        lineNumber: 62,
        columnNumber: 3
    }, ("TURBOPACK compile-time value", void 0)));
ToastAction.displayName = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$toast$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Action"].displayName;
const ToastClose = /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["forwardRef"](({ className, ...props }, ref)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$toast$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Close"], {
        ref: ref,
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cn"])('absolute right-2 top-2 rounded-md p-1 text-foreground/50 opacity-0 transition-opacity hover:text-foreground focus:opacity-100 focus:outline-none focus:ring-2 group-hover:opacity-100 group-[.destructive]:text-red-300 group-[.destructive]:hover:text-red-50 group-[.destructive]:focus:ring-red-400 group-[.destructive]:focus:ring-offset-red-600', className),
        "toast-close": "",
        ...props,
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__["X"], {
            className: "h-4 w-4"
        }, void 0, false, {
            fileName: "[project]/components/ui/toast.tsx",
            lineNumber: 86,
            columnNumber: 5
        }, ("TURBOPACK compile-time value", void 0))
    }, void 0, false, {
        fileName: "[project]/components/ui/toast.tsx",
        lineNumber: 77,
        columnNumber: 3
    }, ("TURBOPACK compile-time value", void 0)));
ToastClose.displayName = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$toast$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Close"].displayName;
const ToastTitle = /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["forwardRef"](({ className, ...props }, ref)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$toast$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Title"], {
        ref: ref,
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cn"])('text-sm font-semibold', className),
        ...props
    }, void 0, false, {
        fileName: "[project]/components/ui/toast.tsx",
        lineNumber: 95,
        columnNumber: 3
    }, ("TURBOPACK compile-time value", void 0)));
ToastTitle.displayName = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$toast$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Title"].displayName;
const ToastDescription = /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["forwardRef"](({ className, ...props }, ref)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$toast$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Description"], {
        ref: ref,
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cn"])('text-sm opacity-90', className),
        ...props
    }, void 0, false, {
        fileName: "[project]/components/ui/toast.tsx",
        lineNumber: 107,
        columnNumber: 3
    }, ("TURBOPACK compile-time value", void 0)));
ToastDescription.displayName = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$toast$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Description"].displayName;
;
}),
"[project]/components/ui/toaster.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Toaster",
    ()=>Toaster
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$hooks$2f$use$2d$toast$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/hooks/use-toast.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$toast$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/ui/toast.tsx [app-ssr] (ecmascript)");
'use client';
;
;
;
function Toaster() {
    const { toasts } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$hooks$2f$use$2d$toast$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useToast"])();
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$toast$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ToastProvider"], {
        children: [
            toasts.map(function({ id, title, description, action, ...props }) {
                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$toast$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Toast"], {
                    ...props,
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "grid gap-1",
                            children: [
                                title && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$toast$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ToastTitle"], {
                                    children: title
                                }, void 0, false, {
                                    fileName: "[project]/components/ui/toaster.tsx",
                                    lineNumber: 22,
                                    columnNumber: 25
                                }, this),
                                description && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$toast$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ToastDescription"], {
                                    children: description
                                }, void 0, false, {
                                    fileName: "[project]/components/ui/toaster.tsx",
                                    lineNumber: 24,
                                    columnNumber: 17
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/ui/toaster.tsx",
                            lineNumber: 21,
                            columnNumber: 13
                        }, this),
                        action,
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$toast$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ToastClose"], {}, void 0, false, {
                            fileName: "[project]/components/ui/toaster.tsx",
                            lineNumber: 28,
                            columnNumber: 13
                        }, this)
                    ]
                }, id, true, {
                    fileName: "[project]/components/ui/toaster.tsx",
                    lineNumber: 20,
                    columnNumber: 11
                }, this);
            }),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$toast$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ToastViewport"], {}, void 0, false, {
                fileName: "[project]/components/ui/toaster.tsx",
                lineNumber: 32,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/components/ui/toaster.tsx",
        lineNumber: 17,
        columnNumber: 5
    }, this);
}
}),
"[project]/components/theme-provider.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ThemeProvider",
    ()=>ThemeProvider
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$themes$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next-themes/dist/index.mjs [app-ssr] (ecmascript)");
"use client";
;
;
function ThemeProvider({ children, ...props }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$themes$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ThemeProvider"], {
        defaultTheme: "light",
        ...props,
        children: children
    }, void 0, false, {
        fileName: "[project]/components/theme-provider.tsx",
        lineNumber: 6,
        columnNumber: 5
    }, this);
}
}),
"[project]/lib/translations.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "translations",
    ()=>translations
]);
const translations = {
    en: {
        // Navigation
        "nav.home": "Home",
        "nav.marketplace": "Marketplace",
        "nav.dashboard": "Dashboard",
        "nav.admin": "Admin",
        "nav.login": "Login",
        "nav.signup": "Sign Up",
        "nav.logout": "Logout",
        "nav.backToDashboard": "Back to Dashboard",
        "nav.backToMarketplace": "Back to Marketplace",
        // Auth
        "auth.login.title": "Welcome Back",
        "auth.login.subtitle": "Sign in to your account",
        "auth.login.email": "Email",
        "auth.login.password": "Password",
        "auth.login.button": "Sign In",
        "auth.login.noAccount": "Don't have an account?",
        "auth.login.signupLink": "Sign up",
        "auth.signup.title": "Create Account",
        "auth.signup.subtitle": "Join our marketplace",
        "auth.signup.storeName": "Store Name",
        "auth.signup.email": "Email",
        "auth.signup.password": "Password",
        "auth.signup.role": "I want to",
        "auth.signup.buyer": "Buy products from local farms",
        "auth.signup.seller": "Sell my farm products",
        "auth.signup.button": "Create Account",
        "auth.signup.hasAccount": "Already have an account?",
        "auth.signup.loginLink": "Sign in",
        // Marketplace
        "marketplace.title": "Poultry Products",
        "marketplace.subtitle": "Browse fresh chicken and egg products from local farms",
        "marketplace.search": "Search products...",
        "marketplace.filter": "Filter",
        "marketplace.sort": "Sort by",
        "marketplace.allCategories": "All Categories",
        "marketplace.allCities": "All Cities",
        "marketplace.cityFilter": "Filter by City",
        "marketplace.newest": "Newest",
        "marketplace.priceLowHigh": "Price: Low to High",
        "marketplace.priceHighLow": "Price: High to Low",
        "marketplace.showing": "Showing",
        "marketplace.product": "product",
        "marketplace.products": "products",
        "marketplace.noProducts": "No products available yet. Check back soon!",
        "marketplace.noMatch": "No products found matching your filters.",
        "marketplace.viewDetails": "View Details",
        "marketplace.buyNow": "Buy Now",
        // Dashboard
        "dashboard.title": "Seller Dashboard",
        "dashboard.welcome": "Welcome",
        "dashboard.tabs.products": "Products",
        "dashboard.tabs.orders": "Orders",
        "dashboard.tabs.analytics": "Analytics",
        "dashboard.stats.totalProducts": "Total Products",
        "dashboard.stats.avgPrice": "Average Price",
        "dashboard.stats.totalValue": "Total Value",
        "dashboard.stats.listedMarketplace": "Listed in marketplace",
        "dashboard.addProduct": "Add Product",
        "dashboard.yourProducts": "Your Products",
        "dashboard.noProducts": "No products yet. Start by adding your first product!",
        "dashboard.product.name": "Product Name",
        "dashboard.product.category": "Category",
        "dashboard.product.price": "Price",
        "dashboard.product.stock": "Stock",
        "dashboard.product.city": "City",
        "dashboard.product.description": "Description",
        "dashboard.product.image": "Image URL",
        "dashboard.product.edit": "Edit",
        "dashboard.product.delete": "Delete",
        "dashboard.product.save": "Save Product",
        "dashboard.product.cancel": "Cancel",
        // Dashboard - Store Settings
        "dashboard.storeSettings.title": "Store Settings",
        "dashboard.storeSettings.button": "Store Settings",
        "dashboard.storeSettings.description": "Customize your store appearance",
        "dashboard.storeSettings.storeName": "Store Name",
        "dashboard.storeSettings.storeLogo": "Store Logo",
        "dashboard.storeSettings.storeCover": "Store Cover Image",
        "dashboard.storeSettings.recommendedSize": "Recommended size: 1920x400px for best results",
        "dashboard.storeSettings.uploading": "Uploading...",
        "dashboard.storeSettings.saveButton": "Save Settings",
        "dashboard.storeSettings.saving": "Saving...",
        "dashboard.storeSettings.yourStore": "Your Store",
        "dashboard.storeSettings.manageStore": "Manage your store settings and share your unique store URL",
        "dashboard.browseAsBuyer": "Browse as Buyer",
        "dashboard.adminAnalytics": "Admin Analytics",
        "dashboard.orders.title": "Customer Orders",
        "dashboard.orders.totalOrders": "Total Orders",
        "dashboard.orders.noOrders": "No orders yet. Orders will appear here when customers make purchases.",
        "dashboard.orders.customer": "Customer",
        "dashboard.orders.quantity": "Quantity",
        "dashboard.orders.total": "Total",
        "dashboard.orders.payment": "Payment",
        "dashboard.orders.deliveryAddress": "Delivery Address",
        "dashboard.orders.notes": "Notes",
        "dashboard.orders.acceptOrder": "Accept Order",
        "dashboard.orders.refuse": "Refuse",
        "dashboard.orders.markCompleted": "Mark as Completed",
        "dashboard.orders.delete": "Delete",
        "dashboard.product.addButton": "Add Product",
        "dashboard.product.adding": "Adding...",
        "dashboard.product.saveChanges": "Save Changes",
        "dashboard.product.saving": "Saving...",
        // Common
        "common.loading": "Loading...",
        "common.error": "Error",
        "common.success": "Success",
        "common.save": "Save",
        "common.cancel": "Cancel",
        "common.delete": "Delete",
        "common.edit": "Edit",
        "common.view": "View",
        "common.close": "Close",
        "common.search": "Search",
        "common.currency": "MAD",
        // Incubator
        "incubator.title": "Chicken Egg Incubator Tracker",
        "incubator.subtitle": "Track your 21-day chicken egg incubation journey",
        "incubator.backToDashboard": "Back to Dashboard",
        "incubator.startNew": "Start New Incubation",
        "incubator.startDescription": "Enter the start date and add chicken breeds with egg counts",
        "incubator.startDate": "Start Date",
        "incubator.selectStartDate": "Select start date",
        "incubator.breedsAndCounts": "Chicken Breeds & Egg Counts",
        "incubator.addBreed": "Add Breed",
        "incubator.selectBreed": "Select breed",
        "incubator.hatchRate": "hatch rate",
        "incubator.eggs": "eggs",
        "incubator.totalEggs": "Total Eggs",
        "incubator.expectedHatch": "Expected Hatch",
        "incubator.chicks": "chicks",
        "incubator.startTracking": "Start Tracking",
        "incubator.incubationProgress": "Incubation Progress",
        "incubator.day": "Day",
        "incubator.of": "of",
        "incubator.started": "Started",
        "incubator.reset": "Reset",
        "incubator.progress": "Progress",
        "incubator.expectedFinish": "Expected Finish",
        "incubator.breedBreakdown": "Breed Breakdown",
        "incubator.ofTotal": "of total",
        "incubator.predicted": "predicted",
        "incubator.noBreeds": "No breeds added yet.",
        "incubator.timeline": "21-Day Incubation Timeline",
        "incubator.timelineDescription": "Key milestones and care instructions",
        "incubator.critical": "CRITICAL",
        "incubator.scheduled": "Scheduled",
        "incubator.day1Title": "Day 1 - Incubation Start",
        "incubator.day1Description": "Begin incubation. Temperature: 37.5°C (99.5°F), Humidity: 50-55%",
        "incubator.day3Title": "Day 3 - Start Flipping",
        "incubator.day3Description": "Begin turning eggs 3-5 times daily to prevent embryo adhesion",
        "incubator.day7Title": "Day 7 - First Candling",
        "incubator.day7Description": "Check for embryo development. Remove non-viable eggs. Look for blood vessels and dark spot (embryo)",
        "incubator.day14Title": "Day 14 - Second Candling",
        "incubator.day14Description": "Verify development progress. Air cell should be visible and embryo should fill most of the egg",
        "incubator.day18Title": "Day 18 - Stop Flipping & Lockdown",
        "incubator.day18Description": "STOP turning eggs immediately. Reduce temperature to 37°C, increase humidity to 65-70%. Begin lockdown phase",
        "incubator.day21Title": "Day 21 - Hatching Day",
        "incubator.day21Description": "Chicks should begin hatching. Maintain high humidity and DO NOT OPEN INCUBATOR",
        "incubator.upcomingFlip": "Upcoming: Start Flipping Tomorrow",
        "incubator.flipInstructions": "Begin turning eggs 3–5 times daily on",
        "incubator.ongoingIncubation": "Incubation Ongoing",
        "incubator.keepTurning": "Keep turning eggs 3–5 times daily until lockdown.",
        "incubator.nextKeyDate": "Next key date",
        "incubator.upcomingLockdown": "Upcoming Lockdown",
        "incubator.lockdownInstructions": "Stop turning eggs and prepare to increase humidity and reduce temperature on",
        "incubator.lockdownTitle": "LOCKDOWN: Stop Flipping Now",
        "incubator.lockdownNow": "Stop flipping eggs immediately. Reduce temperature to ~37°C and increase humidity to 65–70%.",
        "incubator.hatchExpected": "Hatch expected",
        "incubator.hatchingApproaching": "Hatching Approaching",
        "incubator.hatchingLikely": "Hatching likely tomorrow",
        "incubator.avoidOpening": "Avoid opening the incubator",
        "incubator.hatchingDay": "Hatching Day!",
        "incubator.hatchingReached": "Hatching day reached",
        "incubator.monitorChicks": "Monitor chicks closely — avoid opening incubator unless necessary"
    },
    ar: {
        // Navigation
        "nav.home": "الرئيسية",
        "nav.marketplace": "السوق",
        "nav.dashboard": "لوحة التحكم",
        "nav.admin": "المسؤول",
        "nav.login": "تسجيل الدخول",
        "nav.signup": "إنشاء حساب",
        "nav.logout": "تسجيل الخروج",
        "nav.backToDashboard": "العودة للوحة التحكم",
        "nav.backToMarketplace": "العودة للسوق",
        // Auth
        "auth.login.title": "مرحباً بعودتك",
        "auth.login.subtitle": "سجل الدخول إلى حسابك",
        "auth.login.email": "البريد الإلكتروني",
        "auth.login.password": "كلمة المرور",
        "auth.login.button": "تسجيل الدخول",
        "auth.login.noAccount": "ليس لديك حساب؟",
        "auth.login.signupLink": "إنشاء حساب",
        "auth.signup.title": "إنشاء حساب",
        "auth.signup.subtitle": "انضم إلى سوقنا",
        "auth.signup.storeName": "اسم المتجر",
        "auth.signup.email": "البريد الإلكتروني",
        "auth.signup.password": "كلمة المرور",
        "auth.signup.role": "أريد أن",
        "auth.signup.buyer": "أشتري منتجات من المزارع المحلية",
        "auth.signup.seller": "أبيع منتجات مزرعتي",
        "auth.signup.button": "إنشاء حساب",
        "auth.signup.hasAccount": "لديك حساب بالفعل؟",
        "auth.signup.loginLink": "تسجيل الدخول",
        // Marketplace
        "marketplace.title": "منتجات الدواجن",
        "marketplace.subtitle": "تصفح منتجات الدجاج والبيض الطازجة من المزارع المحلية",
        "marketplace.search": "ابحث عن المنتجات...",
        "marketplace.filter": "تصفية",
        "marketplace.sort": "ترتيب حسب",
        "marketplace.allCategories": "جميع الفئات",
        "marketplace.allCities": "جميع المدن",
        "marketplace.cityFilter": "تصفية حسب المدينة",
        "marketplace.newest": "الأحدث",
        "marketplace.priceLowHigh": "السعر: من الأدنى للأعلى",
        "marketplace.priceHighLow": "السعر: من الأعلى للأدنى",
        "marketplace.showing": "عرض",
        "marketplace.product": "منتج",
        "marketplace.products": "منتجات",
        "marketplace.noProducts": "لا توجد منتجات متاحة حالياً. تحقق مرة أخرى قريباً!",
        "marketplace.noMatch": "لم يتم العثور على منتجات مطابقة للفلاتر.",
        "marketplace.viewDetails": "عرض التفاصيل",
        "marketplace.buyNow": "اشترِ الآن",
        // Dashboard
        "dashboard.title": "لوحة تحكم البائع",
        "dashboard.welcome": "مرحباً",
        "dashboard.tabs.products": "المنتجات",
        "dashboard.tabs.orders": "الطلبات",
        "dashboard.tabs.analytics": "التحليلات",
        "dashboard.stats.totalProducts": "إجمالي المنتجات",
        "dashboard.stats.avgPrice": "متوسط السعر",
        "dashboard.stats.totalValue": "القيمة الإجمالية",
        "dashboard.stats.listedMarketplace": "مدرجة في السوق",
        "dashboard.addProduct": "إضافة منتج",
        "dashboard.yourProducts": "منتجاتك",
        "dashboard.noProducts": "لا توجد منتجات بعد. ابدأ بإضافة منتجك الأول!",
        "dashboard.product.name": "اسم المنتج",
        "dashboard.product.category": "الفئة",
        "dashboard.product.price": "السعر",
        "dashboard.product.stock": "المخزون",
        "dashboard.product.city": "المدينة",
        "dashboard.product.description": "الوصف",
        "dashboard.product.image": "رابط الصورة",
        "dashboard.product.edit": "تعديل",
        "dashboard.product.delete": "حذف",
        "dashboard.product.save": "حفظ المنتج",
        "dashboard.product.cancel": "إلغاء",
        // Dashboard - Store Settings
        "dashboard.storeSettings.title": "إعدادات المتجر",
        "dashboard.storeSettings.button": "إعدادات المتجر",
        "dashboard.storeSettings.description": "تخصيص مظهر متجرك",
        "dashboard.storeSettings.storeName": "اسم المتجر",
        "dashboard.storeSettings.storeLogo": "شعار المتجر",
        "dashboard.storeSettings.storeCover": "صورة غلاف المتجر",
        "dashboard.storeSettings.recommendedSize": "الحجم الموصى به: 1920x400 بكسل للحصول على أفضل النتائج",
        "dashboard.storeSettings.uploading": "جاري الرفع...",
        "dashboard.storeSettings.saveButton": "حفظ الإعدادات",
        "dashboard.storeSettings.saving": "جاري الحفظ...",
        "dashboard.storeSettings.yourStore": "متجرك",
        "dashboard.storeSettings.manageStore": "إدارة إعدادات متجرك ومشاركة رابط متجرك الفريد",
        "dashboard.browseAsBuyer": "التصفح كمشتري",
        "dashboard.adminAnalytics": "تحليلات المسؤول",
        "dashboard.orders.title": "طلبات العملاء",
        "dashboard.orders.totalOrders": "إجمالي الطلبات",
        "dashboard.orders.noOrders": "لا توجد طلبات بعد. ستظهر الطلبات هنا عندما يقوم العملاء بالشراء.",
        "dashboard.orders.customer": "العميل",
        "dashboard.orders.quantity": "الكمية",
        "dashboard.orders.total": "الإجمالي",
        "dashboard.orders.payment": "الدفع",
        "dashboard.orders.deliveryAddress": "عنوان التسليم",
        "dashboard.orders.notes": "ملاحظات",
        "dashboard.orders.acceptOrder": "قبول الطلب",
        "dashboard.orders.refuse": "رفض",
        "dashboard.orders.markCompleted": "وضع علامة مكتمل",
        "dashboard.orders.delete": "حذف",
        "dashboard.product.addButton": "إضافة منتج",
        "dashboard.product.adding": "جاري الإضافة...",
        "dashboard.product.saveChanges": "حفظ التغييرات",
        "dashboard.product.saving": "جاري الحفظ...",
        // Common
        "common.loading": "جاري التحميل...",
        "common.error": "خطأ",
        "common.success": "نجح",
        "common.save": "حفظ",
        "common.cancel": "إلغاء",
        "common.delete": "حذف",
        "common.edit": "تعديل",
        "common.view": "عرض",
        "common.close": "إغلاق",
        "common.search": "بحث",
        "common.currency": "درهم",
        // Incubator
        "incubator.title": "متتبع حاضنة بيض الدجاج",
        "incubator.subtitle": "تتبع رحلة حضانة بيض الدجاج لمدة 21 يوماً",
        "incubator.backToDashboard": "العودة للوحة التحكم",
        "incubator.startNew": "بدء حضانة جديدة",
        "incubator.startDescription": "أدخل تاريخ البدء وأضف سلالات الدجاج مع عدد البيض",
        "incubator.startDate": "تاريخ البدء",
        "incubator.selectStartDate": "حدد تاريخ البدء",
        "incubator.breedsAndCounts": "سلالات الدجاج وعدد البيض",
        "incubator.addBreed": "إضافة سلالة",
        "incubator.selectBreed": "اختر السلالة",
        "incubator.hatchRate": "معدل الفقس",
        "incubator.eggs": "بيضة",
        "incubator.totalEggs": "إجمالي البيض",
        "incubator.expectedHatch": "الفقس المتوقع",
        "incubator.chicks": "كتاكيت",
        "incubator.startTracking": "بدء التتبع",
        "incubator.incubationProgress": "تقدم الحضانة",
        "incubator.day": "اليوم",
        "incubator.of": "من",
        "incubator.started": "بدأت",
        "incubator.reset": "إعادة تعيين",
        "incubator.progress": "التقدم",
        "incubator.expectedFinish": "الانتهاء المتوقع",
        "incubator.breedBreakdown": "تفصيل السلالات",
        "incubator.ofTotal": "من الإجمالي",
        "incubator.predicted": "متوقع",
        "incubator.noBreeds": "لم تتم إضافة أي سلالات بعد.",
        "incubator.timeline": "الجدول الزمني للحضانة لمدة 21 يوماً",
        "incubator.timelineDescription": "المعالم الرئيسية وتعليمات العناية",
        "incubator.critical": "حرج",
        "incubator.scheduled": "مجدول",
        "incubator.day1Title": "اليوم 1 - بداية الحضانة",
        "incubator.day1Description": "ابدأ الحضانة. درجة الحرارة: 37.5 درجة مئوية، الرطوبة: 50-55٪",
        "incubator.day3Title": "اليوم 3 - بدء التقليب",
        "incubator.day3Description": "ابدأ بتدوير البيض 3-5 مرات يومياً لمنع التصاق الجنين",
        "incubator.day7Title": "اليوم 7 - الفحص الأول",
        "incubator.day7Description": "افحص تطور الجنين. أزل البيض غير القابل للحياة. ابحث عن الأوعية الدموية والبقعة الداكنة (الجنين)",
        "incubator.day14Title": "اليوم 14 - الفحص الثاني",
        "incubator.day14Description": "تحقق من تقدم التطور. يجب أن تكون الخلية الهوائية مرئية ويجب أن يملأ الجنين معظم البيضة",
        "incubator.day18Title": "اليوم 18 - توقف عن التقليب والإغلاق",
        "incubator.day18Description": "توقف عن تدوير البيض فوراً. اخفض درجة الحرارة إلى 37 درجة مئوية، زد الرطوبة إلى 65-70٪. ابدأ مرحلة الإغلاق",
        "incubator.day21Title": "اليوم 21 - يوم الفقس",
        "incubator.day21Description": "يجب أن تبدأ الكتاكيت بالفقس. حافظ على رطوبة عالية ولا تفتح الحاضنة",
        "incubator.upcomingFlip": "قادم: ابدأ التقليب غداً",
        "incubator.flipInstructions": "ابدأ بتدوير البيض 3-5 مرات يومياً في",
        "incubator.ongoingIncubation": "الحضانة جارية",
        "incubator.keepTurning": "استمر في تدوير البيض 3-5 مرات يومياً حتى الإغلاق.",
        "incubator.nextKeyDate": "التاريخ الرئيسي التالي",
        "incubator.upcomingLockdown": "إغلاق قادم",
        "incubator.lockdownInstructions": "توقف عن تدوير البيض واستعد لزيادة الرطوبة وتقليل درجة الحرارة في",
        "incubator.lockdownTitle": "إغلاق: توقف عن التقليب الآن",
        "incubator.lockdownNow": "توقف عن تقليب البيض فوراً. اخفض درجة الحرارة إلى ~37 درجة مئوية وزد الرطوبة إلى 65-70٪.",
        "incubator.hatchExpected": "الفقس المتوقع",
        "incubator.hatchingApproaching": "الفقس يقترب",
        "incubator.hatchingLikely": "من المحتمل الفقس غداً",
        "incubator.avoidOpening": "تجنب فتح الحاضنة",
        "incubator.hatchingDay": "يوم الفقس!",
        "incubator.hatchingReached": "تم الوصول إلى يوم الفقس",
        "incubator.monitorChicks": "راقب الكتاكيت عن كثب - تجنب فتح الحاضنة إلا إذا لزم الأمر"
    },
    fr: {
        // Navigation
        "nav.home": "Accueil",
        "nav.marketplace": "Marché",
        "nav.dashboard": "Tableau de bord",
        "nav.admin": "Admin",
        "nav.login": "Connexion",
        "nav.signup": "S'inscrire",
        "nav.logout": "Déconnexion",
        "nav.backToDashboard": "Retour au tableau de bord",
        "nav.backToMarketplace": "Retour au marché",
        // Auth
        "auth.login.title": "Bon retour",
        "auth.login.subtitle": "Connectez-vous à votre compte",
        "auth.login.email": "Email",
        "auth.login.password": "Mot de passe",
        "auth.login.button": "Se connecter",
        "auth.login.noAccount": "Vous n'avez pas de compte?",
        "auth.login.signupLink": "S'inscrire",
        "auth.signup.title": "Créer un compte",
        "auth.signup.subtitle": "Rejoignez notre marché",
        "auth.signup.storeName": "Nom du magasin",
        "auth.signup.email": "Email",
        "auth.signup.password": "Mot de passe",
        "auth.signup.role": "Je veux",
        "auth.signup.buyer": "Acheter des produits de fermes locales",
        "auth.signup.seller": "Vendre les produits de ma ferme",
        "auth.signup.button": "Créer un compte",
        "auth.signup.hasAccount": "Vous avez déjà un compte?",
        "auth.signup.loginLink": "Se connecter",
        // Marketplace
        "marketplace.title": "Produits avicoles",
        "marketplace.subtitle": "Parcourez les produits frais de poulet et d'œufs des fermes locales",
        "marketplace.search": "Rechercher des produits...",
        "marketplace.filter": "Filtrer",
        "marketplace.sort": "Trier par",
        "marketplace.allCategories": "Toutes les catégories",
        "marketplace.allCities": "Toutes les villes",
        "marketplace.cityFilter": "Filtrer par ville",
        "marketplace.newest": "Plus récent",
        "marketplace.priceLowHigh": "Prix: Bas à élevé",
        "marketplace.priceHighLow": "Prix: Élevé à bas",
        "marketplace.showing": "Affichage",
        "marketplace.product": "produit",
        "marketplace.products": "produits",
        "marketplace.noProducts": "Aucun produit disponible pour le moment. Revenez bientôt!",
        "marketplace.noMatch": "Aucun produit trouvé correspondant à vos filtres.",
        "marketplace.viewDetails": "Voir les détails",
        "marketplace.buyNow": "Acheter maintenant",
        // Dashboard
        "dashboard.title": "Tableau de bord vendeur",
        "dashboard.welcome": "Bienvenue",
        "dashboard.tabs.products": "Produits",
        "dashboard.tabs.orders": "Commandes",
        "dashboard.tabs.analytics": "Analytique",
        "dashboard.stats.totalProducts": "Total des produits",
        "dashboard.stats.avgPrice": "Prix moyen",
        "dashboard.stats.totalValue": "Valeur totale",
        "dashboard.stats.listedMarketplace": "Listé sur le marché",
        "dashboard.addProduct": "Ajouter un produit",
        "dashboard.yourProducts": "Vos produits",
        "dashboard.noProducts": "Aucun produit encore. Commencez par ajouter votre premier produit!",
        "dashboard.product.name": "Nom du produit",
        "dashboard.product.category": "Catégorie",
        "dashboard.product.price": "Prix",
        "dashboard.product.stock": "Stock",
        "dashboard.product.city": "Ville",
        "dashboard.product.description": "Description",
        "dashboard.product.image": "URL de l'image",
        "dashboard.product.edit": "Modifier",
        "dashboard.product.delete": "Supprimer",
        "dashboard.product.save": "Enregistrer le produit",
        "dashboard.product.cancel": "Annuler",
        // Dashboard - Store Settings
        "dashboard.storeSettings.title": "Paramètres du magasin",
        "dashboard.storeSettings.button": "Paramètres du magasin",
        "dashboard.storeSettings.description": "Personnalisez l'apparence de votre magasin",
        "dashboard.storeSettings.storeName": "Nom du magasin",
        "dashboard.storeSettings.storeLogo": "Logo du magasin",
        "dashboard.storeSettings.storeCover": "Image de couverture du magasin",
        "dashboard.storeSettings.recommendedSize": "Taille recommandée: 1920x400px pour de meilleurs résultats",
        "dashboard.storeSettings.uploading": "Téléchargement...",
        "dashboard.storeSettings.saveButton": "Enregistrer les paramètres",
        "dashboard.storeSettings.saving": "Enregistrement...",
        "dashboard.storeSettings.yourStore": "Votre magasin",
        "dashboard.storeSettings.manageStore": "Gérez les paramètres de votre magasin et partagez votre URL unique",
        "dashboard.browseAsBuyer": "Parcourir en tant qu'acheteur",
        "dashboard.adminAnalytics": "Analytiques Admin",
        "dashboard.orders.title": "Commandes clients",
        "dashboard.orders.totalOrders": "Total des commandes",
        "dashboard.orders.noOrders": "Aucune commande pour le moment. Les commandes apparaîtront ici lorsque les clients effectueront des achats.",
        "dashboard.orders.customer": "Client",
        "dashboard.orders.quantity": "Quantité",
        "dashboard.orders.total": "Total",
        "dashboard.orders.payment": "Paiement",
        "dashboard.orders.deliveryAddress": "Adresse de livraison",
        "dashboard.orders.notes": "Notes",
        "dashboard.orders.acceptOrder": "Accepter la commande",
        "dashboard.orders.refuse": "Refuser",
        "dashboard.orders.markCompleted": "Marquer comme terminé",
        "dashboard.orders.delete": "Supprimer",
        "dashboard.product.addButton": "Ajouter un produit",
        "dashboard.product.adding": "Ajout...",
        "dashboard.product.saveChanges": "Enregistrer les modifications",
        "dashboard.product.saving": "Enregistrement...",
        // Common
        "common.loading": "Chargement...",
        "common.error": "Erreur",
        "common.success": "Succès",
        "common.save": "Enregistrer",
        "common.cancel": "Annuler",
        "common.delete": "Supprimer",
        "common.edit": "Modifier",
        "common.view": "Voir",
        "common.close": "Fermer",
        "common.search": "Rechercher",
        "common.currency": "MAD",
        // Incubator
        "incubator.title": "Suivi d'incubateur d'œufs de poule",
        "incubator.subtitle": "Suivez votre parcours d'incubation d'œufs de poule de 21 jours",
        "incubator.backToDashboard": "Retour au tableau de bord",
        "incubator.startNew": "Démarrer une nouvelle incubation",
        "incubator.startDescription": "Entrez la date de début et ajoutez les races de poulet avec le nombre d'œufs",
        "incubator.startDate": "Date de début",
        "incubator.selectStartDate": "Sélectionner la date de début",
        "incubator.breedsAndCounts": "Races de poulet et nombre d'œufs",
        "incubator.addBreed": "Ajouter une race",
        "incubator.selectBreed": "Sélectionner une race",
        "incubator.hatchRate": "taux d'éclosion",
        "incubator.eggs": "œufs",
        "incubator.totalEggs": "Total d'œufs",
        "incubator.expectedHatch": "Éclosion attendue",
        "incubator.chicks": "poussins",
        "incubator.startTracking": "Commencer le suivi",
        "incubator.incubationProgress": "Progrès d'incubation",
        "incubator.day": "Jour",
        "incubator.of": "sur",
        "incubator.started": "Commencé",
        "incubator.reset": "Réinitialiser",
        "incubator.progress": "Progrès",
        "incubator.expectedFinish": "Fin prévue",
        "incubator.breedBreakdown": "Répartition des races",
        "incubator.ofTotal": "du total",
        "incubator.predicted": "prédit",
        "incubator.noBreeds": "Aucune race ajoutée pour le moment.",
        "incubator.timeline": "Calendrier d'incubation de 21 jours",
        "incubator.timelineDescription": "Étapes clés et instructions de soins",
        "incubator.critical": "CRITIQUE",
        "incubator.scheduled": "Programmé",
        "incubator.day1Title": "Jour 1 - Début de l'incubation",
        "incubator.day1Description": "Commencez l'incubation. Température: 37,5°C, Humidité: 50-55%",
        "incubator.day3Title": "Jour 3 - Commencer le retournement",
        "incubator.day3Description": "Commencez à tourner les œufs 3 à 5 fois par jour pour éviter l'adhésion de l'embryon",
        "incubator.day7Title": "Jour 7 - Premier mirage",
        "incubator.day7Description": "Vérifiez le développement de l'embryon. Retirez les œufs non viables. Recherchez les vaisseaux sanguins et la tache sombre (embryon)",
        "incubator.day14Title": "Jour 14 - Deuxième mirage",
        "incubator.day14Description": "Vérifiez les progrès du développement. La poche d'air doit être visible et l'embryon doit remplir la majeure partie de l'œuf",
        "incubator.day18Title": "Jour 18 - Arrêter le retournement et confinement",
        "incubator.day18Description": "ARRÊTEZ de tourner les œufs immédiatement. Réduisez la température à 37°C, augmentez l'humidité à 65-70%. Commencez la phase de confinement",
        "incubator.day21Title": "Jour 21 - Jour d'éclosion",
        "incubator.day21Description": "Les poussins devraient commencer à éclore. Maintenez une humidité élevée et NE PAS OUVRIR L'INCUBATEUR",
        "incubator.upcomingFlip": "À venir: Commencer le retournement demain",
        "incubator.flipInstructions": "Commencez à tourner les œufs 3 à 5 fois par jour le",
        "incubator.ongoingIncubation": "Incubation en cours",
        "incubator.keepTurning": "Continuez à tourner les œufs 3 à 5 fois par jour jusqu'au confinement.",
        "incubator.nextKeyDate": "Prochaine date clé",
        "incubator.upcomingLockdown": "Confinement à venir",
        "incubator.lockdownInstructions": "Arrêtez de tourner les œufs et préparez-vous à augmenter l'humidité et à réduire la température le",
        "incubator.lockdownTitle": "CONFINEMENT: Arrêter le retournement maintenant",
        "incubator.lockdownNow": "Arrêtez de retourner les œufs immédiatement. Réduisez la température à ~37°C et augmentez l'humidité à 65-70%.",
        "incubator.hatchExpected": "Éclosion prévue",
        "incubator.hatchingApproaching": "L'éclosion approche",
        "incubator.hatchingLikely": "Éclosion probable demain",
        "incubator.avoidOpening": "Évitez d'ouvrir l'incubateur",
        "incubator.hatchingDay": "Jour d'éclosion!",
        "incubator.hatchingReached": "Jour d'éclosion atteint",
        "incubator.monitorChicks": "Surveillez attentivement les poussins - évitez d'ouvrir l'incubateur sauf si nécessaire"
    }
};
}),
"[project]/contexts/language-context.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "LanguageProvider",
    ()=>LanguageProvider,
    "useLanguage",
    ()=>useLanguage
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
"use client";
;
;
const LanguageContext = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createContext"])(undefined);
function LanguageProvider({ children }) {
    const [locale, setLocaleState] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("en");
    const [isClient, setIsClient] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        setIsClient(true);
        const savedLocale = localStorage.getItem("locale");
        if (savedLocale && (savedLocale === "en" || savedLocale === "ar" || savedLocale === "fr")) {
            setLocaleState(savedLocale);
            if (savedLocale === "ar") {
                document.documentElement.dir = "rtl";
                document.documentElement.lang = "ar";
            } else if (savedLocale === "fr") {
                document.documentElement.dir = "ltr";
                document.documentElement.lang = "fr";
            } else {
                document.documentElement.dir = "ltr";
                document.documentElement.lang = "en";
            }
        }
    }, []);
    const setLocale = (newLocale)=>{
        setLocaleState(newLocale);
        if (isClient) {
            localStorage.setItem("locale", newLocale);
            if (newLocale === "ar") {
                document.documentElement.dir = "rtl";
                document.documentElement.lang = "ar";
            } else if (newLocale === "fr") {
                document.documentElement.dir = "ltr";
                document.documentElement.lang = "fr";
            } else {
                document.documentElement.dir = "ltr";
                document.documentElement.lang = "en";
            }
        }
    };
    const t = (key)=>{
        const { translations } = __turbopack_context__.r("[project]/lib/translations.ts [app-ssr] (ecmascript)");
        return translations[locale]?.[key] || key;
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(LanguageContext.Provider, {
        value: {
            locale,
            setLocale,
            t
        },
        children: children
    }, void 0, false, {
        fileName: "[project]/contexts/language-context.tsx",
        lineNumber: 59,
        columnNumber: 10
    }, this);
}
function useLanguage() {
    const context = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useContext"])(LanguageContext);
    if (context === undefined) {
        throw new Error("useLanguage must be used within a LanguageProvider");
    }
    return context;
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__a1d7e63c._.js.map