args=("$@")

function install {
  (
    echo "Installing node project ... "
    echo $1
    cd $1;\
    echo ${args[0]}
    npm install "${args[0]}";\
  )
}

install .
install ./service
