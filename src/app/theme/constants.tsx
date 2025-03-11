/**
 * @fileoverview Core UI constants and theme configuration for Tembo AML
 * Following Material Design 3 theming guidelines for color tokens and elevation
 */

import { CheckOutlined, ClearOutlined, CloseOutlined, DeleteOutlined, DownloadOutlined, EditOutlined, EyeOutlined, PlusOutlined, RedoOutlined, ShareAltOutlined } from "@ant-design/icons";
import { CSSProperties } from "react";

/**
 * Type definitions for theme tokens
 */
type ColorToken = string;
type ElevationToken = string;
type RadiusToken = number;

/**
 * Core design tokens for Tembo AML
 * Contains fundamental UI constants used across the application
 */
export class DesignTokens {
    /**
     * Elevation and shadow configurations
     * Using Material Design elevation system
     */
    static readonly Elevation = {
        /** Default elevation for cards and surfaces */
        LEVEL_1: "rgba(17, 12, 46, 0.11) 0px 4px 8px" as ElevationToken,
        /** Medium elevation for floating elements */
        LEVEL_2: "rgba(17, 12, 46, 0.11) 0px 8px 16px" as ElevationToken,
        /** High elevation for modals and dropdowns */
        LEVEL_3: "rgba(17, 12, 46, 0.11) 20px 48px 100px 20px" as ElevationToken,
    } as const;

    /**
     * Border radius tokens following Material Design shape system
     */
    static readonly Radius = {
        /** Default border radius for most components */
        DEFAULT: 10 as RadiusToken,
        /** Larger radius for prominent elements */
        LARGE: 16 as RadiusToken,
        /** Smaller radius for compact elements */
        SMALL: 8 as RadiusToken,
        /** Rounded radius for pills and badges */
        PILL: 24 as RadiusToken,
    } as const;

    /**
     * Z-index stack order configuration
     */
    static readonly ZIndex = {
        MODAL: 1000,
        DROPDOWN: 900,
        HEADER: 800,
        CONTENT: 1,
    } as const;
}

/**
 * Tembo AML color system following Material Design 3 color tokens
 * Implements a role-based color system for consistent theming
 */
export class ThemeColors {
    /**
     * Primary colors - Main brand colors
     */
    static readonly Primary = {
        /** Main brand color - Tembo Blue */
        DEFAULT: "#28ABE3" as ColorToken,
        /** Text/icons on primary color */
        ON: "#FFFFFF" as ColorToken,
        /** Container variant of primary */
        CONTAINER: "#EDF9FF" as ColorToken,
        /** Text/icons on primary container */
        ON_CONTAINER: "#28ABE3" as ColorToken,
    };

    /**
     * Accent colors for emphasis and contrast
     */
    static readonly Accent = {
        /** Secondary emphasis color */
        DEFAULT: "#000000" as ColorToken,
        /** Text/icons on accent color */
        ON: "#FFFFFF" as ColorToken,
        /** Container variant of accent */
        CONTAINER: "#343434" as ColorToken,
        /** Text/icons on accent container */
        ON_CONTAINER: "#FFFFFF" as ColorToken,
    };

    /**
     * Surface colors for backgrounds and cards
     */
    static readonly Surface = {
        /** Main surface color */
        DEFAULT: "#FBFDFE" as ColorToken,
        /** Text/icons on surface */
        ON: "#242124" as ColorToken,
        /** Container/card surface variant */
        CONTAINER: "#FAF7FF" as ColorToken,
        /** Text/icons on surface container */
        ON_CONTAINER: "#474747" as ColorToken,
    };

    /**
     * Error and status colors
     */
    static readonly Status = {
        /** Error state color */
        ERROR: "#ba1a1a" as ColorToken,
        /** Text/icons on error */
        ON_ERROR: "#ffffff" as ColorToken,
        /** Error container variant */
        ERROR_CONTAINER: "#ffdad6" as ColorToken,
        /** Text/icons on error container */
        ON_ERROR_CONTAINER: "#93000a" as ColorToken,
    };

    /**
     * Text hierarchy colors
     */
    static readonly Text = {
        /** Primary text color */
        PRIMARY: "#242124" as ColorToken,
        /** Secondary text color */
        SECONDARY: "#6D759D" as ColorToken,
        /** Tertiary text color */
        TERTIARY: "#9198B3" as ColorToken,
        /** Disabled text color */
        DISABLED: "#b3b3b3" as ColorToken,
    };

    /**
     * UI element colors
     */
    static readonly UI = {
        /** Divider and border color */
        DIVIDER: "#DCDCDC" as ColorToken,
        /** Disabled state background */
        DISABLED: "#DCDCDC" as ColorToken,
        /** Text/icons on disabled state */
        ON_DISABLED: "#696969" as ColorToken,
    };

    /**
     * Base colors
     */
    static readonly Base = {
        WHITE: "#FFFFFF" as ColorToken,
        BLACK: "#000000" as ColorToken,
        TRANSPARENT: "transparent" as ColorToken,
    };
}

/**
 * Common CSS properties used throughout Tembo AML
 */
export const CommonStyles = {
    /** Full width style */
    FULL_WIDTH: { width: "100%" } as CSSProperties,

    /** Common card style */
    CARD: {
        backgroundColor: ThemeColors.Surface.CONTAINER,
        borderRadius: DesignTokens.Radius.DEFAULT,
        boxShadow: DesignTokens.Elevation.LEVEL_1,
    } as CSSProperties,
} as const;

/**
 * CSS property helper functions
 */
export const StyleUtils = {
    /**
     * Creates a padding style with consistent spacing
     */
    padding: (value: number): CSSProperties => ({
        padding: value,
    }),

    /**
     * Creates a margin style with consistent spacing
     */
    margin: (value: number): CSSProperties => ({
        margin: value,
    }),

    /**
     * Creates a border radius style
     */
    borderRadius: (value: number = DesignTokens.Radius.DEFAULT): CSSProperties => ({
        borderRadius: value,
    }),
} as const;

/**
 * Icon components used throughout Tembo AML
 * Centralizes icon imports and provides consistent naming
 */
export class Icons {
    /** Icon for view/preview actions */
    static readonly view = EyeOutlined;
    /** Icon for edit actions */
    static readonly edit = EditOutlined;
    /** Icon for delete actions */
    static readonly delete = DeleteOutlined;
    /** Icon for add/create actions */
    static readonly add = PlusOutlined;
    /** Icon for download actions */
    static readonly download = DownloadOutlined;
    /** Icon for share actions */
    static readonly share = ShareAltOutlined;
    /** Icon for clear actions */
    static readonly clear = ClearOutlined;
    /** Icon for refresh/reset actions */
    static readonly refresh = RedoOutlined;
    /** Icon for approve/check actions */
    static readonly approve = CheckOutlined;
    /** Icon for reject/cancel actions */
    static readonly reject = CloseOutlined;
    /** Prevents instantiation */
    private constructor() { }
}
