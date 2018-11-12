function deploy {
  (
    cd $1;\
    echo "Deploying $1 to stage $2 in region $3..."
    sls deploy --stage $2 --region $3 --verbose;\
  )
}

deploy ./service/ $1 $2
