<?php
// Downloads one pinned version of the Commmerce UI hosted build into vendor/.
// Pinned files never change; raise the version after reading the release notes.
//   php fetch-vendor.php            (or COMMMERCE_UI_VERSION=1.20.4 php fetch-vendor.php)

$version = getenv('COMMMERCE_UI_VERSION') ?: '1.20.4';
$base = "https://cdn.commmerce.com/commmerceui/v/$version";
@mkdir(__DIR__ . '/vendor');
$download = function (string $file) use ($base, $version): string {
    $bytes = @file_get_contents("$base/$file");
    if ($bytes === false) {
        fwrite(STDERR, "Could not download $base/$file\n");
        exit(1);
    }
    file_put_contents(__DIR__ . "/vendor/$file", $bytes);
    echo "vendor/$file (v$version)\n";
    return $bytes;
};
foreach (['tokens.css', 'cdn.js', 'app-bridge.js'] as $file) {
    $download($file);
}
// The Poppins typeface: fonts.css and the font files it points at (fonts/*.woff2, plus the font licence).
preg_match_all('#url\([\'"]?(fonts/[\w.-]+)[\'"]?\)#', $download('fonts.css'), $m);
if ($m[1]) {
    @mkdir(__DIR__ . '/vendor/fonts');
    foreach (array_unique([...$m[1], 'fonts/OFL.txt']) as $file) {
        $download($file);
    }
}
