import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

import 'generated/tokens.g.dart';
import 'theme.dart';

/// The admin's frame: puts the header bar, the side navigation, the page, the bottom navigation and the mobile
/// menu in their places, so every Commmerce product gets the same layout. Mirrors `<cm-app-frame>`. Since 1.1.
/// For Commmerce products only, not for apps: apps run inside the admin, which already has this frame.
///
/// When the frame is [wideWidth] (1024) logical pixels wide or more, [navigation] sits on the start side under
/// the header and scrolls on its own when it is taller than the frame; narrower, it is hidden and
/// [bottomNavigation] is shown along the bottom. The frame follows its own width (normally the window's), not the
/// screen size class. The header stays at the top, below the device's notch or status bar.
///
/// [mobileMenu] covers the header and the page, above them and below the bottom navigation, while [menuOpen] is
/// true on a narrow frame. Open it from the bottom navigation's "More" item (`onSelected: (i) => i.id == 'more'
/// ? setState(() => open = !open) : …`), and pass `selectedId: open ? 'more' : page` so "More" shows as the current tab
/// while the menu is open. Focus moves into the menu when it opens and back to where it was when it
/// closes; Esc asks [onMenuOpenChanged] to close it. While it is open, the header and page can't be reached
/// with the keyboard or a screen reader, as with `inert` on the web.
///
/// Collapse the side navigation to its icon rail with [CmSideNav.collapsed]; the frame follows its width.
///
/// With [panel] the frame takes the merchant dashboard's look: on wide frames the page sits in a white rounded
/// panel (bg-surface, radius 12, a 1px border-subtle) with a 20px gutter beside and below the side navigation, on the
/// grey page under the white header; a [CmPage] inside drops its own grey background. Narrow frames (bottom
/// navigation) run the panel edge to edge, white, without a gutter or corners. Since 1.6.
class CmAppFrame extends StatefulWidget {
  const CmAppFrame({
    super.key,
    required this.header,
    required this.body,
    this.navigation,
    this.bottomNavigation,
    this.mobileMenu,
    this.menuOpen = false,
    this.onMenuOpenChanged,
    this.panel = false,
  });

  /// Frames at least this wide show [navigation]; narrower ones show [bottomNavigation].
  static const double wideWidth = 1024;

  /// A [CmHeaderBar].
  final Widget header;

  /// The page, usually a [CmPage].
  final Widget body;

  /// A [CmSideNav]. Shown when the frame is [wideWidth] wide or more.
  final Widget? navigation;

  /// A [CmBottomNavigation]. Shown when the frame is narrower than [wideWidth].
  final Widget? bottomNavigation;

  /// A [CmMobileMenu]. Shown over the page while [menuOpen] is true and the frame is narrow.
  final Widget? mobileMenu;

  /// Shows [mobileMenu] (on narrow frames).
  final bool menuOpen;

  /// Called with false when the merchant presses Esc in the open menu. Set [menuOpen] in response.
  final ValueChanged<bool>? onMenuOpenChanged;

  /// Shows the page in a white rounded panel beside the side navigation (the merchant dashboard frame). Since 1.6.
  final bool panel;

  /// Whether the nearest frame is wide (shows the side navigation). False outside a frame.
  static bool isWide(BuildContext context) => context.dependOnInheritedWidgetOfExactType<_FrameScope>()?.wide ?? false;

  /// Whether the nearest frame shows the page in a [panel]. [CmPage] is then transparent. False outside a frame.
  static bool isPanel(BuildContext context) => context.dependOnInheritedWidgetOfExactType<_FrameScope>()?.panel ?? false;

  @override
  State<CmAppFrame> createState() => _CmAppFrameState();
}

class _FrameScope extends InheritedWidget {
  const _FrameScope({required this.wide, required this.panel, required super.child});
  final bool wide, panel;
  @override
  bool updateShouldNotify(_FrameScope old) => wide != old.wide || panel != old.panel;
}

class _CmAppFrameState extends State<CmAppFrame> {
  final _menuScope = FocusScopeNode(debugLabel: 'CmAppFrame menu');
  FocusNode? _returnFocus;
  bool _covered = false;

  @override
  void dispose() {
    _menuScope.dispose();
    super.dispose();
  }

  void _coveredChanged(bool covered) {
    if (covered == _covered) return;
    _covered = covered;
    if (covered) {
      _returnFocus = FocusManager.instance.primaryFocus;
      WidgetsBinding.instance.addPostFrameCallback((_) {
        if (!mounted) return;
        _menuScope.requestFocus();
        // Onto the first control in the menu.
        if (_menuScope.focusedChild == null) _menuScope.nextFocus();
      });
    } else {
      final back = _returnFocus;
      _returnFocus = null;
      WidgetsBinding.instance.addPostFrameCallback((_) {
        if (back != null && back.context != null && back.canRequestFocus) back.requestFocus();
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final c = CmTheme.colorsOf(context);
    return LayoutBuilder(builder: (context, box) {
      final wide = box.maxWidth >= CmAppFrame.wideWidth;
      final covered = !wide && widget.menuOpen && widget.mobileMenu != null;
      _coveredChanged(covered);
      final header = Container(color: c.bgSurface, child: SafeArea(bottom: false, child: widget.header));
      Widget inert(Widget child) => covered ? ExcludeFocus(child: ExcludeSemantics(child: child)) : child;
      final Widget content;
      if (wide) {
        content = Column(crossAxisAlignment: CrossAxisAlignment.stretch, children: [
          header,
          Expanded(
            child: Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
              if (widget.navigation != null)
                Padding(
                  padding: const EdgeInsetsDirectional.fromSTEB(CmSpace.s20, CmSpace.s20, 0, CmSpace.s20),
                  child: Align(alignment: AlignmentDirectional.topStart, widthFactor: 1, child: widget.navigation),
                ),
              Expanded(
                child: widget.panel
                    ? Container(
                        margin: const EdgeInsets.all(CmSpace.s20),
                        clipBehavior: Clip.antiAlias,
                        decoration: BoxDecoration(color: c.bgSurface, border: Border.all(color: c.borderSubtle), borderRadius: BorderRadius.circular(CmRadius.lg)),
                        child: widget.body,
                      )
                    : widget.body,
              ),
            ]),
          ),
        ]);
      } else {
        content = Column(crossAxisAlignment: CrossAxisAlignment.stretch, children: [
          Expanded(
            child: Stack(fit: StackFit.expand, children: [
              Column(crossAxisAlignment: CrossAxisAlignment.stretch, children: [
                inert(header),
                Expanded(child: inert(widget.panel ? ColoredBox(color: c.bgSurface, child: widget.body) : widget.body)),
              ]),
              if (covered)
                CallbackShortcuts(
                  bindings: {const SingleActivator(LogicalKeyboardKey.escape): () => widget.onMenuOpenChanged?.call(false)},
                  child: FocusScope(
                    node: _menuScope,
                    child: Container(
                      color: c.bgPage,
                      child: SafeArea(bottom: false, child: widget.mobileMenu!),
                    ),
                  ),
                ),
            ]),
          ),
          if (widget.bottomNavigation != null) widget.bottomNavigation!,
        ]);
      }
      return _FrameScope(wide: wide, panel: widget.panel, child: Material(color: c.bgPage, child: content));
    });
  }
}
