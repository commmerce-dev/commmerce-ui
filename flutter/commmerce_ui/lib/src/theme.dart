import 'package:flutter/material.dart';

import 'generated/tokens.g.dart';
import 'pickers.dart';

/// Commmerce tokens attached to a [ThemeData]. Read them with [CmTheme.of].
@immutable
class CmTheme extends ThemeExtension<CmTheme> {
  const CmTheme({required this.colors, required this.brightness});

  /// Every colour token for the current theme.
  final CmColors colors;

  /// Light or dark.
  final Brightness brightness;

  /// The tokens for the nearest theme. Falls back to light if the app has no Commmerce theme.
  static CmTheme of(BuildContext context) =>
      Theme.of(context).extension<CmTheme>() ?? const CmTheme(colors: CmColors.light, brightness: Brightness.light);

  /// Shortcut for `CmTheme.of(context).colors`.
  static CmColors colorsOf(BuildContext context) => of(context).colors;

  /// A complete Material theme in Commmerce colours, type and shapes.
  static ThemeData light() => _build(CmColors.light, Brightness.light);

  /// The dark theme, built from the Figma file's dark neutrals.
  static ThemeData dark() => _build(CmColors.dark, Brightness.dark);

  static ThemeData _build(CmColors c, Brightness b) {
    // Every Material 3 slot is set from a token, so stock Material widgets (chips, segmented buttons, menus,
    // snack bars, sheets) never fall back to Material's own derived colours or surface tint.
    final scheme = ColorScheme(
      brightness: b,
      primary: c.actionPrimary,
      onPrimary: c.actionPrimaryText,
      primaryContainer: c.bgSelected,
      onPrimaryContainer: c.textDefault,
      secondary: c.textAttention,
      onSecondary: c.textOnDark,
      secondaryContainer: c.bgSelected,
      onSecondaryContainer: c.textDefault,
      tertiary: c.textInformation,
      onTertiary: c.bgSurface,
      tertiaryContainer: c.bgInformationSoft,
      onTertiaryContainer: c.textDefault,
      error: c.textCritical,
      onError: c.textOnDark,
      errorContainer: c.bgCritical,
      onErrorContainer: c.textCritical,
      surface: c.bgSurface,
      onSurface: c.textDefault,
      onSurfaceVariant: c.textTertiary,
      surfaceDim: c.bgPage,
      surfaceBright: c.bgSurface,
      surfaceContainerLowest: c.bgSurface,
      surfaceContainerLow: c.bgPage,
      surfaceContainer: c.bgInset,
      surfaceContainerHigh: c.bgHover,
      surfaceContainerHighest: c.bgHover,
      outline: c.borderInput,
      outlineVariant: c.borderSubtle,
      inverseSurface: c.textDefault,
      onInverseSurface: c.bgSurface,
      inversePrimary: c.actionPrimaryText,
      shadow: Colors.black,
      scrim: c.overlay,
      surfaceTint: Colors.transparent,
    );
    final text = Typography.material2021(platform: TargetPlatform.android).black.apply(
          fontFamily: 'packages/$cmFontPackage/$cmFontFamily',
          bodyColor: c.textDefault,
          displayColor: c.textDefault,
        );
    OutlineInputBorder border(Color color, [double width = 1]) => OutlineInputBorder(
          borderRadius: BorderRadius.circular(CmRadius.sm),
          borderSide: BorderSide(color: color, width: width),
        );
    return ThemeData(
      useMaterial3: true,
      brightness: b,
      colorScheme: scheme,
      fontFamily: 'packages/$cmFontPackage/$cmFontFamily',
      textTheme: text,
      scaffoldBackgroundColor: c.bgPage,
      canvasColor: c.bgSurface,
      dividerColor: c.borderSubtle,
      focusColor: c.borderStrong.withValues(alpha: 0.12),
      hoverColor: c.bgHover,
      splashFactory: NoSplash.splashFactory,
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: c.bgSurface,
        contentPadding: const EdgeInsets.symmetric(horizontal: CmSpace.s12, vertical: CmSpace.s8),
        hintStyle: TextStyle(color: c.textTertiary),
        enabledBorder: border(c.borderInput),
        focusedBorder: border(c.borderStrong, 2),
        errorBorder: border(c.borderCritical),
        focusedErrorBorder: border(c.borderCritical, 2),
        disabledBorder: border(c.borderSubtle),
      ),
      dialogTheme: DialogThemeData(backgroundColor: c.bgSurface),
      datePickerTheme: cmDatePickerTheme(c),
      // No scrollbars (owner, 24 Nov 2026): scroll areas scroll, but never draw a bar.
      scrollbarTheme: const ScrollbarThemeData(
        thickness: WidgetStatePropertyAll(0),
        thumbVisibility: WidgetStatePropertyAll(false),
        trackVisibility: WidgetStatePropertyAll(false),
      ),
      extensions: [CmTheme(colors: c, brightness: b)],
    );
  }

  @override
  CmTheme copyWith({CmColors? colors, Brightness? brightness}) =>
      CmTheme(colors: colors ?? this.colors, brightness: brightness ?? this.brightness);

  @override
  CmTheme lerp(ThemeExtension<CmTheme>? other, double t) {
    if (other is! CmTheme) return this;
    return CmTheme(colors: colors.lerp(other.colors, t), brightness: t < 0.5 ? brightness : other.brightness);
  }
}

/// Row density of lists and tables (owner standard, 1.6): [comfortable] rows are 56 (lists) or 48 (tables) tall,
/// [compact] rows 40.
enum CmDensity { comfortable, compact }

/// Screen size classes used by every responsive widget.
enum CmScreen { phone, tablet, desktop }

/// Breakpoints: phones below 600, tablets below 1100, desktop above.
abstract final class CmBreakpoints {
  static const double tablet = 600;
  static const double desktop = 1100;

  /// The size class for the current window width.
  static CmScreen of(BuildContext context) {
    final w = MediaQuery.sizeOf(context).width;
    if (w < tablet) return CmScreen.phone;
    if (w < desktop) return CmScreen.tablet;
    return CmScreen.desktop;
  }
}

/// The type ramp for the current screen: Responsive on phones, Desktop otherwise.
class CmText {
  CmText._(this._phone);
  final bool _phone;

  /// Picks the ramp for this context's screen size.
  factory CmText.of(BuildContext context) => CmText._(CmBreakpoints.of(context) == CmScreen.phone);

  TextStyle get headingLg => _phone ? CmTypeResponsive.headingLg : CmType.headingLg;
  TextStyle get headingMd => _phone ? CmTypeResponsive.headingMd : CmType.headingMd;

  /// Section heading inside a page: 18/26 semibold (owner standard, 1.6), the same on phones.
  TextStyle get headingSection => CmType.headingSection;
  TextStyle get headingSm => _phone ? CmTypeResponsive.headingSm : CmType.headingSm;
  TextStyle get bodyLg => _phone ? CmTypeResponsive.bodyLg : CmType.bodyLg;
  TextStyle get bodyMd => _phone ? CmTypeResponsive.bodyMd : CmType.bodyMd;
  TextStyle get bodySm => _phone ? CmTypeResponsive.bodySm : CmType.bodySm;
  TextStyle get bodyXs => _phone ? CmTypeResponsive.bodyXs : CmType.bodyXs;
  TextStyle get label => _phone ? CmTypeResponsive.label : CmType.label;
}

/// Small label style (text actions, badges, captions): medium weight, no tracking. Since 1.5 labels are in
/// sentence case (no capitals, no letter spacing); the name is kept for existing code. Sizes below 12 are raised to 12.
TextStyle cmCaps(double size, Color color) => TextStyle(
      fontFamily: cmFontFamily,
      package: cmFontPackage,
      fontSize: size < 12 ? 12 : size,
      fontWeight: FontWeight.w500,
      color: color,
    );

/// True on touch-first platforms (Android, iOS, Fuchsia): the Flutter stand-in for the web's `pointer: coarse`.
/// Controls are then at least [CmControlHeight.touch] (44) tall and field text is 16px.
bool cmIsTouch(BuildContext context) => switch (Theme.of(context).platform) {
      TargetPlatform.android || TargetPlatform.iOS || TargetPlatform.fuchsia => true,
      _ => false,
    };

/// [height] raised to [CmControlHeight.touch] (44) on touch screens: form fields and other controls that are drawn
/// at the full touch height.
double cmControlHeight(BuildContext context, double height) =>
    cmIsTouch(context) && height < CmControlHeight.touch ? CmControlHeight.touch : height;

/// Height a button (or icon button) is drawn at (owner standard, 1.6): [height] on desktops, at least
/// [CmControlHeight.lg] (40) on touch screens, where [cmTouchSlop] more all round makes the hit area 44.
double cmButtonHeight(BuildContext context, double height) =>
    cmIsTouch(context) && height < CmControlHeight.lg ? CmControlHeight.lg : height;

/// Invisible margin around a button on touch screens that takes its 40px drawing to a 44px hit area (web `::after`
/// inset -2px). Zero elsewhere.
double cmTouchSlop(BuildContext context) => cmIsTouch(context) ? (CmControlHeight.touch - CmControlHeight.lg) / 2 : 0;

/// Height of a form field (text field, select, combobox, search, date pickers, colour field; owner standard, 1.6):
/// 40 by default, 32 when [small] (filter rows and toolbars), 44 on touch screens whatever the size.
double cmFieldHeight(BuildContext context, {bool small = false}) =>
    cmIsTouch(context) ? CmControlHeight.touch : (small ? CmControlHeight.sm : CmControlHeight.lg);

/// Text typed in a form field (owner standard, 1.6): 14/20 on desktops, 16/20 on touch screens, so phones don't zoom
/// into the field. Since 1.7.
TextStyle cmFieldText(BuildContext context) => cmIsTouch(context) ? CmType.bodyMd.copyWith(fontSize: 16, height: 20 / 16) : CmType.bodyMd;

/// Content padding that centres one 14/20 line of text in a field [height] tall.
EdgeInsets cmFieldPadding(double height, {double horizontal = CmSpace.s12}) =>
    EdgeInsets.symmetric(horizontal: horizontal, vertical: (height - 20) / 2);

/// True when the layout is phone-width (640px or less, the web's `max-width: 640px`): card padding 16, page
/// padding 16, page title 20.
bool cmIsNarrow(BuildContext context) => MediaQuery.sizeOf(context).width <= 640;

/// [duration] (a [CmMotion] token), or zero when the platform asks for no animations
/// (`MediaQuery.disableAnimations`, the Flutter side of `prefers-reduced-motion`).
Duration cmDuration(BuildContext context, [Duration duration = CmMotion.base]) =>
    (MediaQuery.maybeDisableAnimationsOf(context) ?? false) ? Duration.zero : duration;
