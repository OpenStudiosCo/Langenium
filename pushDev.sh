if [ -z $1 ]; then
    echo "Need to enter a commit message"
else
   
    scp -r client/* zeski@paulbrzeski.com:/home/content/08/10109808/html/langenium/dev
    git add .
    eval "git commit -m \"$1\""
    git push origin dev
fi

