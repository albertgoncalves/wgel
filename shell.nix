with import <nixpkgs> {};
llvmPackages_10.stdenv.mkDerivation {
    name = "_";
    buildInputs = [
        glibcLocales
        htmlTidy
        nodejs
        okular
        parallel
        python3
        python3Packages.flake8
        shellcheck
    ];
    shellHook = ''
        . .shellhook
    '';
}
