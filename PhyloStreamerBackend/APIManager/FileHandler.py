from Bio import SeqIO, AlignIO, Seq
import os

class FileHandler:
    def __init__(self, f, preferredFormat, nodeName):
        fileNameArray = str(f).split(".")
        self.file = f
        self.fileFormat = fileNameArray.pop()
        self.fileName = "".join(fileNameArray)
        self.analysisDestination = f'../Analysis/{nodeName}/'
        self.preferredFormat = preferredFormat
        self.fileFormatMaps = { # Fasta
                                "fas": "fasta", "fasta": "fasta", "fna": "fasta", 
                                "ffn": "fasta", "faa": "fasta", "frn": "fasta", 
                                "fa": "fasta",
     
                                # Nexus
                                "nexus": "nexus", "nex": "nexus", "nxs": "nexus",

                                #Phylip
                                "phylip": "phylip", "phy": "phylip", "phyllip": "phylip",

                                #Genbank
                                "genbank": "genbank", "gb":"genbank", "gbk":"genbank",

                                #Clustal
                                "aln": "clustal", "clustal":"clustal"
                        }

    def handleUploadedFile(self):
        if self.fileSupported():
            with open( f'{self.analysisDestination}{str(self.file)}', 'wb+') as destination:
                for chunk in (self.file).chunks():
                    destination.write(chunk)
            if self.conversionRequired():
                converted = self.handleConversion()
                if converted:
                    return [True, {"message": f'File uploaded successfully and converted the file format from {self.fileFormat} to {((self.preferredFormat).split(","))[0]}'}]
                else:
                    return [False, {"message": f'Something went wrong while converting file'}]

            return [True, {"message": f'File uploaded successfully'}]
        else:
            return [False, {"message": f'Something went wrong while uploading file'}]
    


    def fileSupported(self):
        if self.preferredFormat == "":
            return True
        else:
            if self.fileFormat not in self.fileFormatMaps:
                return False
            else:
                return True

    def conversionRequired(self):
        if self.preferredFormat == "":
            return False
        else:
            return True

    def handleConversion(self):
        fileDestination = self.analysisDestination+self.fileName+"."+self.fileFormat
        conversionFormat = ((self.preferredFormat).split(","))[0]
        if self.fileFormatMaps[self.fileFormat] == "clustal":
            try:
            # Parse a Nexus file
                sequences = SeqIO.parse(f'{fileDestination}', "clustal")
                SeqIO.write(sequences, f'{self.analysisDestination}{self.fileName}.{conversionFormat}', conversionFormat)
                return True
            except Exception as e:
                print(str(e))
                return False
        if self.fileFormatMaps[self.fileFormat] == "genbank":
            try:
            # Parse a Nexus file
                sequences = SeqIO.parse(f'{fileDestination}', "genbank")
                SeqIO.write(sequences, f'{self.analysisDestination}{self.fileName}.{conversionFormat}', conversionFormat)
                return True
            except Exception as e:
                print(str(e))
                return False
        if self.fileFormatMaps[self.fileFormat] == "phylip":
            try:
            # Parse a Nexus file
                sequences = SeqIO.parse(f'{fileDestination}', "phylip")
                SeqIO.write(sequences, f'{self.analysisDestination}{self.fileName}.{conversionFormat}', conversionFormat)
                return True
            except Exception as e:
                print(str(e))
                return False
        if self.fileFormatMaps[self.fileFormat] == "nexus":
            try:
            # Parse a Nexus file
                sequences = SeqIO.parse(f'{fileDestination}', "nexus")
                SeqIO.write(sequences, f'{self.analysisDestination}{self.fileName}.{conversionFormat}', conversionFormat)
                return True
            except Exception as e:
                print(str(e))
                return False
        if self.fileFormatMaps[self.fileFormat] == "fasta":
            try:
                # Parse a FASTA file
                sequences = SeqIO.parse(fileDestination, "fasta")
                SeqIO.write(sequences, f'{self.fileName}.{self.fileFormat}', conversionFormat)
                return True
            except Exception as e:
                if str(e) == "Sequences must all be the same length":
                    input_file = fileDestination
                    records = SeqIO.parse(input_file, 'fasta')
                    records = list(records) # make a copy, otherwise our generator
                                            # is exhausted after calculating maxlen
                    maxlen = max(len(record.seq) for record in records)
                        # pad sequences so that they all have the same length
                    for record in records:
                        if len(record.seq) != maxlen:
                            sequence = str(record.seq).ljust(maxlen, '?')
                            record.seq = Seq.Seq(sequence)
                    assert all(len(record.seq) == maxlen for record in records)
                        # write to temporary file and do alignment
                    output_file = '{}_padded.fasta'.format(os.path.splitext(input_file)[0])
                    with open(output_file, 'w') as f:
                        SeqIO.write(records, f, 'fasta')

                    try:
                        with open(output_file, "rU") as input_handle:
                            with open(f'{self.analysisDestination}{self.fileName}.{conversionFormat}', "w") as output_handle:
                                sequences = SeqIO.parse(input_handle, "fasta")
                                count = SeqIO.write(sequences, output_handle, conversionFormat)
                        return True
                    except Exception as e:
                        print (str(e))
                        return False