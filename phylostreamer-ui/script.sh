dirName="$(pwd)/build/static"


echo ""
echo "Moving JavaScript Files"
echo ""


rm $HOME/Code/PhyloStreamer/PhyloStreamer/PhyloStreamerBackend/staticfiles/js/*
rm $HOME/Code/PhyloStreamer/PhyloStreamer/PhyloStreamerBackend/staticfiles/css/*

cd $dirName/js
fileName=$( ls *.js | grep "^main*" )
mv $fileName "phylo-ui.js"
cp phylo-ui.js $HOME/Code/PhyloStreamer/PhyloStreamer/PhyloStreamerBackend/staticfiles/js
cp *.map $HOME/Code/PhyloStreamer/PhyloStreamer/PhyloStreamerBackend/staticfiles/js

fileName=$( ls *.js | grep "^runtime*" )
mv $fileName "phylo-ui1.js"
cp phylo-ui1.js $HOME/Code/PhyloStreamer/PhyloStreamer/PhyloStreamerBackend/staticfiles/js

fileName=$( ls *.js | grep "^[0-9]" )
mv $fileName "phylo-ui2.js"
cp phylo-ui2.js $HOME/Code/PhyloStreamer/PhyloStreamer/PhyloStreamerBackend/staticfiles/js


cd $dirName/css
pwd
echo ""
echo "Moving CSS Files"
echo ""


fileName=$( ls *.css | grep "^main*" )
mv $fileName "phylo-ui.css"
cp phylo-ui.css $HOME/Code/PhyloStreamer/PhyloStreamer/PhyloStreamerBackend/staticfiles/css


fileName=$( ls *.css | grep "^[0-9]" )
mv $fileName "phylo-ui1.css"
cp phylo-ui1.css $HOME/Code/PhyloStreamer/PhyloStreamer/PhyloStreamerBackend/staticfiles/css
