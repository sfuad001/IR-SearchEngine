colon=":"
cs242="cs242"
for file in *
do
	new=$(echo $file | sed "s/$colon/$cs242/g")
	mv $file $new
done	
